import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { postRecordingDeviceV2 } from '../../../apis/apis/recordingV2';
import { SocketMessage } from '../../../apis/sockets/type';
import useRecordingTurnUploaderV2 from '../../../hooks/useRecordingTurnUploaderV2';
import { TimeBasedStance } from '../../../types/type';
import {
  isAudioRecordingSupported,
  requestMicrophoneStream,
  stopMediaStream,
} from '../../../util/audioRecorder';
import { createTurnKey, RecordingJoin } from '../../../util/recordingJoinLink';
import {
  getAudienceDeviceTokenV2,
  saveAudienceDeviceTokenV2,
} from '../../../util/recordingStorageV2';
import { startTurnRecording, TurnRecording } from '../../../util/turnRecording';
import { getNetworkDelayMs } from './getNetworkDelayMs';

export interface UseAudienceTurnRecorderParams {
  // 공유 링크로 받은 녹음 세션·참가 코드. 없으면 녹음에 참여할 수 없다.
  join: RecordingJoin | null;
  latestMessage: SocketMessage | null;
  latestMessageReceivedAt: number | null;
}

export type AudienceRecorderStatus = 'idle' | 'starting' | 'recording';
export type AudienceRecorderError = 'unsupported' | 'not-allowed' | 'join';

interface Segment {
  timeBoxIndex: number;
  team: TimeBasedStance | null;
}

interface ActiveTurn extends Segment {
  recording: TurnRecording;
}

/**
 * 공유 화면의 청중 기기가 다기기 녹음에 참여해, 사회자가 보낸 타이머 이벤트로 구간을 나눠 녹음하고 올린다.
 * - 실행 상태로 바뀌는 이벤트(재생, 실행 중 팀 전환)를 받은 구간만 녹음하고, 그 이벤트의 version으로 턴 키를 만든다.
 *   사회자 기기도 같은 version을 쓰므로 같은 구간이 같은 턴으로 모인다.
 * - 중도 입장·재연결로 상태 동기화(SYNC)만 받은 진행 중 구간은 시작 version을 모르므로 건너뛴다.
 * - 정지·차례 이동·팀 전환·종료·중단 이벤트에서 구간을 끝내고 올린다.
 */
export default function useAudienceTurnRecorder({
  join,
  latestMessage,
  latestMessageReceivedAt,
}: UseAudienceTurnRecorderParams) {
  const isSupported = useMemo(() => isAudioRecordingSupported(), []);
  const [status, setStatus] = useState<AudienceRecorderStatus>('idle');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<AudienceRecorderError | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const activeRef = useRef<ActiveTurn | null>(null);
  const joinRef = useRef(join);
  const generationRef = useRef(0);
  // 서버 시계 기준 녹음 시작 시각을 구하려고, 마지막 메시지로 잰 기기 시계와 서버 시계의 차이
  const clockOffsetRef = useRef(0);

  useEffect(() => {
    joinRef.current = join;
  }, [join]);

  const getDeviceToken = useCallback(() => {
    const current = joinRef.current;
    return current ? getAudienceDeviceTokenV2(current.sessionKey) : null;
  }, []);
  const renewDeviceToken = useCallback(async () => {
    const current = joinRef.current;
    if (!current) {
      throw new Error('녹음 참가 정보가 없습니다.');
    }
    const { deviceToken } = await postRecordingDeviceV2(current.sessionKey, {
      joinCode: current.joinCode,
    });
    saveAudienceDeviceTokenV2(current.sessionKey, deviceToken);
    return deviceToken;
  }, []);
  const uploader = useRecordingTurnUploaderV2({
    getDeviceToken,
    renewDeviceToken,
  });
  const { upload } = uploader;

  const startTurn = useCallback(
    (segment: Segment, turnKey: string, stream: MediaStream) => {
      const current = joinRef.current;
      if (!current) {
        return;
      }
      const clockOffset = clockOffsetRef.current;
      const recording = startTurnRecording(stream, (recorded) => {
        if (activeRef.current?.recording === recording) {
          activeRef.current = null;
          setIsListening(false);
        }
        if (!recorded) {
          return;
        }
        void upload({
          sessionKey: current.sessionKey,
          turnKey,
          turn: {
            audio: recorded.audio,
            fileName: recorded.fileName,
            timeBoxIndex: segment.timeBoxIndex,
            team: segment.team,
            durationMs: recorded.durationMs,
            startedAtEpochMs: recorded.startedAt + clockOffset,
            metrics: recorded.metrics,
          },
        });
      });
      activeRef.current = { ...segment, recording };
      setIsListening(true);
    },
    [upload],
  );

  const stopTurn = useCallback(() => {
    const active = activeRef.current;
    activeRef.current = null;
    setIsListening(false);
    active?.recording.stop();
  }, []);

  const releaseMicrophone = useCallback(() => {
    stopMediaStream(streamRef.current);
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (status !== 'recording' || !latestMessage) {
      return;
    }
    if (latestMessageReceivedAt !== null && latestMessage.serverTime) {
      clockOffsetRef.current =
        latestMessage.serverTime +
        getNetworkDelayMs(latestMessage.serverTime, latestMessageReceivedAt) -
        latestMessageReceivedAt;
    }
    if (latestMessage.data === null) {
      // 종료·중단 이벤트는 진행 중인 구간을 끝낸다.
      if (
        latestMessage.eventType === 'FINISHED' ||
        latestMessage.eventType === 'ABORT'
      ) {
        stopTurn();
      }
      return;
    }
    const { data } = latestMessage;
    const segment: Segment = {
      timeBoxIndex: data.sequence,
      team:
        data.timerType === 'TIME_BASED' &&
        (data.currentTeam === 'PROS' || data.currentTeam === 'CONS')
          ? data.currentTeam
          : null,
    };
    const isRunning = data.isRunning === true;
    const active = activeRef.current;
    if (
      active &&
      (!isRunning ||
        active.timeBoxIndex !== segment.timeBoxIndex ||
        active.team !== segment.team)
    ) {
      stopTurn();
    }
    const stream = streamRef.current;
    if (
      !isRunning ||
      activeRef.current ||
      latestMessage.eventType === 'SYNC' ||
      typeof latestMessage.version !== 'number' ||
      !stream?.active
    ) {
      return;
    }
    startTurn(
      segment,
      createTurnKey(segment.timeBoxIndex, latestMessage.version),
      stream,
    );
  }, [latestMessage, latestMessageReceivedAt, status, startTurn, stopTurn]);

  // 화면을 떠나면 녹음 중이던 구간까지 올리고 마이크를 놓는다.
  useEffect(() => {
    return () => {
      generationRef.current += 1;
      stopTurn();
      releaseMicrophone();
    };
  }, [releaseMicrophone, stopTurn]);

  // 녹음 참여에 동의한 뒤 부른다. 마이크를 받고, 이 탭에서 처음 참가하면 참가 코드로 기기 토큰을 받는다.
  const start = useCallback(async () => {
    if (!join) {
      return;
    }
    if (!isSupported) {
      setError('unsupported');
      return;
    }
    const generation = ++generationRef.current;
    const isCurrent = () => generation === generationRef.current;
    setStatus('starting');
    setError(null);
    const stream = await requestMicrophoneStream().catch(() => null);
    if (!isCurrent()) {
      stopMediaStream(stream);
      return;
    }
    if (!stream) {
      setError('not-allowed');
      setStatus('idle');
      return;
    }
    streamRef.current = stream;
    if (!getAudienceDeviceTokenV2(join.sessionKey)) {
      const joined = await renewDeviceToken().catch(() => null);
      if (!isCurrent()) {
        return;
      }
      if (!joined) {
        releaseMicrophone();
        setError('join');
        setStatus('idle');
        return;
      }
    }
    setStatus('recording');
  }, [isSupported, join, releaseMicrophone, renewDeviceToken]);

  // 녹음 참여를 멈춘다. 진행 중이던 구간은 올린다.
  const stop = useCallback(() => {
    generationRef.current += 1;
    stopTurn();
    releaseMicrophone();
    setStatus('idle');
  }, [releaseMicrophone, stopTurn]);

  return {
    isAvailable: join !== null,
    isSupported,
    status,
    isListening,
    error,
    pendingCount: uploader.pendingCount,
    failedCount: uploader.failedCount,
    start,
    stop,
  };
}
