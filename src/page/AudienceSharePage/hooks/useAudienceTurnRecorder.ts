import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { postRecordingDeviceV2 } from '../../../apis/apis/recordingV2';
import { APIError } from '../../../apis/primitives';
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
  // 소켓 연결 상태. 끊긴 사이 놓친 이벤트가 있을 수 있어, 다시 연결된 뒤 받은 SYNC로는 진행 중인 구간을 잇지 않는다.
  isConnected: boolean;
}

export type AudienceRecorderStatus = 'idle' | 'starting' | 'recording';
// unavailable: 서버가 참가를 409로 거절함(세션이 끝났거나 기기 정원이 참). 두 경우를 상태 코드로 구분할 수 없어 다시 시도할 수 있게 둔다.
export type AudienceRecorderError =
  'unsupported' | 'not-allowed' | 'join' | 'unavailable';

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
 * - 연결이 끊긴 사이 정지·재생을 놓쳤을 수 있으므로, 재연결 뒤 처음 받은 SYNC에서 진행 중인 구간을 끝내고
 *   다음 시작 이벤트를 기다린다. 연결이 유지된 SYNC는 진행 중인 구간을 그대로 잇는다.
 * - 정지·차례 이동·팀 전환·종료·중단 이벤트에서 구간을 끝내고 올린다.
 * - 참여 중인 세션의 참가 정보가 사라지거나(사회자가 녹음을 끔) 다른 세션으로 바뀌면 녹음을 멈춘다.
 *   끝난 세션이므로 진행 중인 구간은 올리지 않는다.
 * - 참가하거나 기기 토큰을 다시 받으려다 409(세션 종료 또는 기기 정원 초과)를 받으면 참여를 멈추고 알린다.
 *   정원이 돌아올 수 있으므로 그 세션을 막지는 않고 다시 참여할 수 있게 둔다.
 *   이 탭에 보관한 기기 토큰으로 끝난 세션에 참여했다면 첫 구간을 올릴 때 서버가 거절해 이 경로로 알게 된다.
 */
export default function useAudienceTurnRecorder({
  join,
  latestMessage,
  latestMessageReceivedAt,
  isConnected,
}: UseAudienceTurnRecorderParams) {
  const isSupported = useMemo(() => isAudioRecordingSupported(), []);
  const [status, setStatus] = useState<AudienceRecorderStatus>('idle');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<AudienceRecorderError | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const activeRef = useRef<ActiveTurn | null>(null);
  const joinRef = useRef(join);
  const generationRef = useRef(0);
  // 참여 시작(마이크·기기 등록)을 기다리는 중이면 다시 시작하지 않는다.
  const isStartingRef = useRef(false);
  // 참여(시작 중 포함)한 녹음 세션. 참여하지 않으면 null이다.
  const participatingKeyRef = useRef<string | null>(null);
  // 참여 중인 세션에 더 참가할 수 없을 때 참여를 끝낸다. 업로드 복구 경로에서도 부르므로 ref로 둔다.
  const endParticipationRef = useRef<
    (sessionKey: string, nextError: AudienceRecorderError | null) => void
  >(() => {});
  // 연결이 끊겼다가 다시 붙어 아직 SYNC를 받지 못했다.
  const isResyncPendingRef = useRef(false);
  // 서버 시계 기준 녹음 시작 시각을 구하려고, 마지막 메시지로 잰 기기 시계와 서버 시계의 차이
  const clockOffsetRef = useRef(0);

  useEffect(() => {
    joinRef.current = join;
  }, [join]);

  useEffect(() => {
    if (!isConnected) {
      isResyncPendingRef.current = true;
    }
  }, [isConnected]);

  // 기기 토큰은 업로드한 턴의 세션 기준으로 읽는다. 다시 참가할 때 쓰는 참가 코드는 지금 참가 정보가
  // 같은 세션일 때만 있으므로, 녹음 중 참가 정보가 바뀌었으면 이전 세션에는 다시 참가하지 않는다.
  const getDeviceToken = useCallback(
    (sessionKey: string) => getAudienceDeviceTokenV2(sessionKey),
    [],
  );
  const renewDeviceToken = useCallback(async (sessionKey: string) => {
    const current = joinRef.current;
    if (current?.sessionKey !== sessionKey) {
      throw new Error('녹음 참가 정보가 없습니다.');
    }
    const { deviceToken } = await postRecordingDeviceV2(sessionKey, {
      joinCode: current.joinCode,
    }).catch((joinError: unknown) => {
      // 세션이 끝났거나(종료 알림을 놓친 경우) 정원이 차 이 세션에 더 참가할 수 없으면 녹음을 멈춘다.
      if (joinError instanceof APIError && joinError.status === 409) {
        endParticipationRef.current(sessionKey, 'unavailable');
      }
      throw joinError;
    });
    saveAudienceDeviceTokenV2(sessionKey, deviceToken);
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

  // 참여를 끝낸다. 더 받지 않는 세션이므로 진행 중인 구간은 올리지 않는다.
  const { reset: resetUploads } = uploader;
  const endParticipation = useCallback(
    (sessionKey: string, nextError: AudienceRecorderError | null) => {
      if (participatingKeyRef.current !== sessionKey) {
        return;
      }
      participatingKeyRef.current = null;
      generationRef.current += 1;
      isStartingRef.current = false;
      const active = activeRef.current;
      activeRef.current = null;
      active?.recording.cancel();
      setIsListening(false);
      releaseMicrophone();
      resetUploads();
      setError(nextError);
      setStatus('idle');
    },
    [releaseMicrophone, resetUploads],
  );
  useEffect(() => {
    endParticipationRef.current = endParticipation;
  }, [endParticipation]);

  // 참여 중인 세션이 끝나거나 바뀌면 녹음을 멈춘다.
  // 같은 렌더에 정지 이벤트가 함께 와도 끝난 세션의 구간이 올라가지 않도록 타이머 이벤트 처리보다 먼저 둔다.
  const joinSessionKey = join?.sessionKey ?? null;
  useEffect(() => {
    const participatingKey = participatingKeyRef.current;
    if (participatingKey !== null && participatingKey !== joinSessionKey) {
      endParticipation(participatingKey, null);
    }
  }, [endParticipation, joinSessionKey]);

  useEffect(() => {
    // 녹음하지 않는 동안 받은 SYNC도 재연결 동기화를 마친 것으로 본다.
    const isResync =
      latestMessage?.eventType === 'SYNC' && isResyncPendingRef.current;
    if (latestMessage?.eventType === 'SYNC') {
      isResyncPendingRef.current = false;
    }
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
      // 종료 이벤트는 진행 중인 구간을 끝낸다.
      if (latestMessage.eventType === 'FINISHED') {
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
      (isResync ||
        !isRunning ||
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
  // 이미 시작 중이거나 참여 중이면 무시한다. 다시 시작하려면 먼저 stop()을 부른다.
  const start = useCallback(async () => {
    if (!join || isStartingRef.current || streamRef.current?.active) {
      return;
    }
    if (!isSupported) {
      setError('unsupported');
      return;
    }
    const generation = ++generationRef.current;
    const isCurrent = () => generation === generationRef.current;
    isStartingRef.current = true;
    participatingKeyRef.current = join.sessionKey;
    setStatus('starting');
    setError(null);
    try {
      const stream = await requestMicrophoneStream().catch(() => null);
      if (!isCurrent()) {
        stopMediaStream(stream);
        return;
      }
      if (!stream) {
        participatingKeyRef.current = null;
        setError('not-allowed');
        setStatus('idle');
        return;
      }
      releaseMicrophone();
      streamRef.current = stream;
      if (!getAudienceDeviceTokenV2(join.sessionKey)) {
        // 409이면 재참가 경로가 이미 참여를 끝내고 알렸으므로 아래에서 다시 처리하지 않는다.
        const joined = await renewDeviceToken(join.sessionKey).catch(
          () => null,
        );
        if (!isCurrent()) {
          return;
        }
        if (!joined) {
          participatingKeyRef.current = null;
          releaseMicrophone();
          setError('join');
          setStatus('idle');
          return;
        }
      }
      setStatus('recording');
    } finally {
      if (isCurrent()) {
        isStartingRef.current = false;
      }
    }
  }, [isSupported, join, releaseMicrophone, renewDeviceToken]);

  // 녹음 참여를 멈춘다. 진행 중이던 구간은 올린다.
  const stop = useCallback(() => {
    generationRef.current += 1;
    isStartingRef.current = false;
    participatingKeyRef.current = null;
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
