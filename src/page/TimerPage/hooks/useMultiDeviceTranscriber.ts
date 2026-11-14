import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  postRecordingHostDeviceV2,
  postRecordingSessionV2,
} from '../../../apis/apis/recordingV2';
import useRecordingTurnUploaderV2 from '../../../hooks/useRecordingTurnUploaderV2';
import { TimeBasedStance } from '../../../types/type';
import {
  isAudioRecordingSupported,
  requestMicrophoneStream,
  stopMediaStream,
} from '../../../util/audioRecorder';
import { createTurnKey, RecordingJoin } from '../../../util/recordingJoinLink';
import {
  clearHostRecordingV2,
  getHostRecordingV2,
  saveHostRecordingV2,
  updateHostDeviceTokenV2,
} from '../../../util/recordingStorageV2';
import { startTurnRecording, TurnRecording } from '../../../util/turnRecording';

export interface UseMultiDeviceTranscriberParams {
  tableId: number;
  timeBoxIndex: number;
  // 자유토론처럼 한 타임박스 안에서 발언 팀이 바뀌는 경우의 현재 팀
  team: TimeBasedStance | null;
  isRunning: boolean;
  lang: string;
  // 청중에게 보낸 마지막 타이머 전환 이벤트의 version. 공유하지 않으면 null이다.
  getSegmentVersion: () => number | null;
}

export type MultiDeviceTranscriberError =
  'unsupported' | 'not-allowed' | 'session';

interface ActiveTurn {
  timeBoxIndex: number;
  team: TimeBasedStance | null;
  recording: TurnRecording;
}

/**
 * 다기기 녹음 V2의 사회자 기기 녹음. 켜면 녹음 세션을 열고(이미 열었으면 이어서 씀),
 * 타이머가 실행되는 동안 발언 구간마다 녹음해 끝날 때 턴으로 올린다.
 * 전사·속기록 생성은 서버가 하므로 이 기기는 초안을 만들지 않는다.
 * 턴 키는 청중 기기와 맞추려고 구간을 시작한 공유 이벤트의 version을 쓴다.
 */
export default function useMultiDeviceTranscriber(
  params: UseMultiDeviceTranscriberParams,
) {
  const { tableId, timeBoxIndex, team, isRunning, lang, getSegmentVersion } =
    params;
  const isSupported = useMemo(() => isAudioRecordingSupported(), []);

  const [isEnabled, setIsEnabled] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<MultiDeviceTranscriberError | null>(null);
  const [session, setSession] = useState<RecordingJoin | null>(() =>
    toJoin(getHostRecordingV2(tableId)),
  );

  const streamRef = useRef<MediaStream | null>(null);
  const activeRef = useRef<ActiveTurn | null>(null);
  const usedTurnKeysRef = useRef(new Set<string>());
  const generationRef = useRef(0);
  const isMountedRef = useRef(false);
  const tableIdRef = useRef(tableId);
  const getSegmentVersionRef = useRef(getSegmentVersion);

  useEffect(() => {
    tableIdRef.current = tableId;
    getSegmentVersionRef.current = getSegmentVersion;
  }, [tableId, getSegmentVersion]);

  const getDeviceToken = useCallback(
    () => getHostRecordingV2(tableIdRef.current)?.deviceToken ?? null,
    [],
  );
  const renewDeviceToken = useCallback(async () => {
    const current = getHostRecordingV2(tableIdRef.current);
    if (!current) {
      throw new Error('녹음 세션이 없습니다.');
    }
    const { deviceToken } = await postRecordingHostDeviceV2(current.sessionKey);
    updateHostDeviceTokenV2(tableIdRef.current, deviceToken);
    return deviceToken;
  }, []);
  const uploader = useRecordingTurnUploaderV2({
    getDeviceToken,
    renewDeviceToken,
  });
  const { upload } = uploader;

  // 공유하지 않거나, 공유를 끈 뒤 같은 version이 남아 이미 쓴 턴 키가 되면 이 기기만의 턴 키를 쓴다.
  const nextTurnKey = useCallback((index: number, startedAt: number) => {
    const version = getSegmentVersionRef.current();
    const sharedKey = version === null ? null : createTurnKey(index, version);
    const turnKey =
      sharedKey && !usedTurnKeysRef.current.has(sharedKey)
        ? sharedKey
        : createTurnKey(index, startedAt);
    usedTurnKeysRef.current.add(turnKey);
    return turnKey;
  }, []);

  const startTurn = useCallback(
    (index: number, turnTeam: TimeBasedStance | null, stream: MediaStream) => {
      const host = getHostRecordingV2(tableIdRef.current);
      if (!host) {
        return;
      }
      const turnKey = nextTurnKey(index, Date.now());
      const recording = startTurnRecording(stream, (recorded) => {
        if (activeRef.current?.recording === recording) {
          activeRef.current = null;
          setIsListening(false);
        }
        if (!recorded) {
          return;
        }
        void upload({
          sessionKey: host.sessionKey,
          turnKey,
          turn: {
            audio: recorded.audio,
            fileName: recorded.fileName,
            timeBoxIndex: index,
            team: turnTeam,
            durationMs: recorded.durationMs,
            startedAtEpochMs: recorded.startedAt,
            metrics: recorded.metrics,
          },
        });
      });
      activeRef.current = { timeBoxIndex: index, team: turnTeam, recording };
      setIsListening(true);
    },
    [nextTurnKey, upload],
  );

  // 녹음 중인 구간을 끝낸다. 오디오는 녹음기가 멈춘 뒤 올라간다.
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

  const shouldRecord = isEnabled && isRunning && isSupported;

  useEffect(() => {
    const active = activeRef.current;
    if (
      shouldRecord &&
      active &&
      active.timeBoxIndex === timeBoxIndex &&
      active.team === team
    ) {
      return;
    }
    stopTurn();
    if (!shouldRecord) {
      return;
    }
    const stream = streamRef.current;
    if (stream?.active) {
      startTurn(timeBoxIndex, team, stream);
      return;
    }
    // 장치 분리 등으로 마이크를 잃었으면 다시 받는다. 받는 사이 끄거나 구간이 바뀌면 이번 구간은 건너뛴다.
    const generation = generationRef.current;
    requestMicrophoneStream()
      .then((nextStream) => {
        if (generation !== generationRef.current) {
          stopMediaStream(nextStream);
          return;
        }
        streamRef.current = nextStream;
        if (!activeRef.current) {
          startTurn(timeBoxIndex, team, nextStream);
        }
      })
      .catch(() => {
        if (generation === generationRef.current) {
          setError('not-allowed');
          setIsEnabled(false);
        }
      });
  }, [shouldRecord, timeBoxIndex, team, startTurn, stopTurn]);

  // 화면을 떠나면 녹음 중이던 구간까지 올리고 마이크를 놓는다.
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      generationRef.current += 1;
      stopTurn();
      releaseMicrophone();
    };
  }, [releaseMicrophone, stopTurn]);

  // 처음 켤 때 녹음 세션을 열고, 같은 탭에서 다시 켜면 열어 둔 세션에 이어서 올린다.
  const enable = useCallback(
    async (recognitionLanguage?: string) => {
      if (!isSupported) {
        setError('unsupported');
        return;
      }
      const generation = generationRef.current;
      const isCurrent = () =>
        isMountedRef.current && generation === generationRef.current;
      setIsStarting(true);
      try {
        if (!streamRef.current?.active) {
          const stream = await requestMicrophoneStream().catch(() => null);
          if (!stream) {
            if (isCurrent()) {
              setError('not-allowed');
            }
            return;
          }
          if (!isCurrent()) {
            stopMediaStream(stream);
            return;
          }
          streamRef.current = stream;
        }
        let host = getHostRecordingV2(tableIdRef.current);
        if (!host) {
          host = await postRecordingSessionV2({
            tableId: tableIdRef.current,
            language: recognitionLanguage ?? lang,
          }).catch(() => null);
          if (!isCurrent()) {
            return;
          }
          if (!host) {
            setError('session');
            releaseMicrophone();
            return;
          }
          saveHostRecordingV2(tableIdRef.current, {
            sessionKey: host.sessionKey,
            joinCode: host.joinCode,
            deviceToken: host.deviceToken,
          });
        }
        setSession(toJoin(host));
        setError(null);
        setIsEnabled(true);
      } finally {
        if (isCurrent()) {
          setIsStarting(false);
        }
      }
    },
    [isSupported, lang, releaseMicrophone],
  );

  // 녹음을 멈춘다. 녹음 세션은 그대로 두어 다시 켜거나 토론을 끝낼 때 쓴다.
  const disable = useCallback(() => {
    generationRef.current += 1;
    stopTurn();
    releaseMicrophone();
    setIsEnabled(false);
  }, [releaseMicrophone, stopTurn]);

  // 녹음을 버린다. 녹음 중인 구간은 올리지 않고, 이 탭에 보관한 녹음 세션도 지운다.
  const discard = useCallback(() => {
    generationRef.current += 1;
    activeRef.current?.recording.cancel();
    activeRef.current = null;
    releaseMicrophone();
    clearHostRecordingV2(tableIdRef.current);
    usedTurnKeysRef.current.clear();
    uploader.reset();
    setSession(null);
    setIsEnabled(false);
    setIsListening(false);
    setError(null);
  }, [releaseMicrophone, uploader]);

  return {
    isSupported,
    isEnabled,
    isStarting,
    isListening,
    pendingCount: uploader.pendingCount,
    failedCount: uploader.failedCount,
    error,
    session,
    enable,
    disable,
    discard,
  };
}

function toJoin(
  host: { sessionKey: string; joinCode: string } | null,
): RecordingJoin | null {
  return host ? { sessionKey: host.sessionKey, joinCode: host.joinCode } : null;
}
