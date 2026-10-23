import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { postSonioxTranscription } from '../../../apis/apis/stt';
import { TimeBasedStance } from '../../../types/type';
import {
  getRecorderMimeType,
  isAudioRecordingSupported,
  RECORDER_AUDIO_BITS_PER_SECOND,
  requestMicrophoneStream,
  stopMediaStream,
  toAudioFileName,
} from '../../../util/audioRecorder';
import {
  appendSegmentUtterances,
  failPendingSegment,
  markSegmentPending,
  SegmentKey,
  startTranscriptDraft,
} from '../../../util/transcriptDraft';
import { TranscriberError } from './useDebateTranscriber';

export interface UseSonioxTranscriberParams {
  tableId: number;
  timeBoxIndex: number;
  // 자유토론처럼 한 타임박스 안에서 발언 팀이 바뀌는 경우의 현재 팀
  team: TimeBasedStance | null;
  isRunning: boolean;
  lang: string;
}

interface DesiredSegment {
  timeBoxIndex: number;
  team: TimeBasedStance | null;
}

interface RecordingSession {
  tableId: number;
  recorder: MediaRecorder;
  segment: SegmentKey;
  startedAt: number;
  chunks: Blob[];
  // 전사 대기로 기록했는지. 구간을 끝낼 때와 녹음기가 스스로 멈출 때 중 먼저 오는 쪽에서 한 번만 기록한다.
  isPendingMarked: boolean;
}

// 이보다 짧은 구간은 오디오 머리 정보만 담겨 Soniox가 깨진 파일로 거절하므로 보내지 않는다.
// 타이머를 켜자마자 끄거나 자유토론 팀을 바로 바꿀 때 생긴다.
export const MIN_SEGMENT_DURATION_MS = 1000;

let segmentSequence = 0;
const createSegmentKey = (
  timeBoxIndex: number,
  team: TimeBasedStance | null,
): SegmentKey => ({
  id: `soniox-${Date.now()}-${(segmentSequence += 1)}`,
  timeBoxIndex,
  team,
});

/**
 * 타이머가 실행되는 동안 발언 구간(타임박스, 자유토론은 팀) 단위로 오디오를 녹음한다.
 * 구간이 끝나면 오디오를 서버로 보내 Soniox 배치 전사 결과를 초안에 반영한다.
 * 전사 응답은 화면을 떠난 뒤에 와도 초안(sessionStorage)에 저장된다.
 */
export default function useSonioxTranscriber(
  params: UseSonioxTranscriberParams,
) {
  const { tableId, timeBoxIndex, team, isRunning, lang } = params;
  const isSupported = useMemo(() => isAudioRecordingSupported(), []);

  const [isEnabled, setIsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [utteranceCount, setUtteranceCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [error, setError] = useState<TranscriberError | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const activeRef = useRef<RecordingSession | null>(null);
  // 지금 녹음해야 하는 구간. 마이크를 다시 받는 동안 타이머가 멈추거나 구간이 바뀌었는지 확인한다.
  const desiredRef = useRef<DesiredSegment | null>(null);
  const isEnabledRef = useRef(false);
  const isRequestingMicrophoneRef = useRef(false);
  const isMountedRef = useRef(false);
  const hasStartedDraftRef = useRef(false);
  const tableIdRef = useRef(tableId);
  const langRef = useRef(lang);

  // 렌더 중에 ref를 바꾸면 커밋되지 않은 렌더 값이 남을 수 있어 커밋 뒤에 맞춘다.
  // 녹음기 onstop은 effect가 끝난 뒤 이벤트로 오므로 이 값을 읽는다.
  useEffect(() => {
    tableIdRef.current = tableId;
    langRef.current = lang;
  }, [tableId, lang]);

  const markPending = useCallback((session: RecordingSession) => {
    if (session.isPendingMarked) {
      return;
    }
    session.isPendingMarked = true;
    markSegmentPending(session.tableId, session.segment.id, Date.now());
    setPendingCount((prev) => prev + 1);
  }, []);

  // 전사 대기는 구간을 끝낼 때 이미 기록했으므로, 결과를 저장하거나 실패로 남기며 대기를 푼다.
  // 빈 오디오나 너무 짧은 구간은 보내지 않고 문장 없는 구간으로 대기만 푼다.
  const transcribe = useCallback((session: RecordingSession, audio: Blob) => {
    const { tableId: sessionTableId, segment, startedAt } = session;
    const isTooShort = Date.now() - startedAt < MIN_SEGMENT_DURATION_MS;
    if (audio.size === 0 || isTooShort) {
      appendSegmentUtterances(sessionTableId, segment, startedAt, []);
      setPendingCount((prev) => prev - 1);
      return;
    }
    postSonioxTranscription(audio, toAudioFileName(audio.type), langRef.current)
      .then(({ utterances }) => {
        appendSegmentUtterances(sessionTableId, segment, startedAt, utterances);
        setUtteranceCount((prev) => prev + utterances.length);
      })
      .catch(() => {
        failPendingSegment(sessionTableId, segment.id);
        setFailedCount((prev) => prev + 1);
      })
      .finally(() => {
        setPendingCount((prev) => prev - 1);
      });
  }, []);

  const startRecording = useCallback(
    (segment: SegmentKey, stream: MediaStream) => {
      const mimeType = getRecorderMimeType();
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: RECORDER_AUDIO_BITS_PER_SECOND,
      });
      const session: RecordingSession = {
        tableId: tableIdRef.current,
        recorder,
        segment,
        startedAt: Date.now(),
        chunks: [],
        isPendingMarked: false,
      };
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          session.chunks.push(event.data);
        }
      };
      recorder.onstop = () => {
        // 마이크 분리처럼 녹음기가 스스로 멈추면 stopRecording을 거치지 않으므로 여기서 정리한다.
        if (activeRef.current === session) {
          activeRef.current = null;
          setIsListening(false);
        }
        markPending(session);
        const audio = new Blob(session.chunks, {
          type: recorder.mimeType || mimeType || 'audio/webm',
        });
        transcribe(session, audio);
      };
      activeRef.current = session;
      recorder.start();
      setIsListening(true);
    },
    [markPending, transcribe],
  );

  // 녹음 중인 구간을 끝낸다. 남은 오디오는 비동기 onstop에서 전사 요청으로 이어지므로,
  // 그 전에 종료 화면으로 이동해도 기다릴 수 있도록 전사 대기를 먼저 기록한다.
  const stopRecording = useCallback(() => {
    const active = activeRef.current;
    activeRef.current = null;
    setIsListening(false);
    if (!active || active.recorder.state === 'inactive') {
      return;
    }
    markPending(active);
    active.recorder.stop();
  }, [markPending]);

  const releaseMicrophone = useCallback(() => {
    stopMediaStream(streamRef.current);
    streamRef.current = null;
  }, []);

  /**
   * 기록 중인데 마이크 스트림이 없거나 끊긴 경우 다시 받는다.
   * 개발 서버의 코드 갱신(Fast Refresh)이 정리 effect를 실행해 마이크를 놓거나, 장치가 분리된 경우다.
   * 받는 사이 기록을 끄거나 화면을 떠났으면 받은 마이크를 바로 놓는다.
   */
  const reacquireMicrophone = useCallback(() => {
    if (isRequestingMicrophoneRef.current) {
      return;
    }
    isRequestingMicrophoneRef.current = true;
    requestMicrophoneStream()
      .then((stream) => {
        if (!isEnabledRef.current) {
          stopMediaStream(stream);
          return;
        }
        streamRef.current = stream;
        const desired = desiredRef.current;
        if (desired && !activeRef.current) {
          startRecording(
            createSegmentKey(desired.timeBoxIndex, desired.team),
            stream,
          );
        }
      })
      .catch(() => {
        desiredRef.current = null;
        setError('not-allowed');
        setIsEnabled(false);
      })
      .finally(() => {
        isRequestingMicrophoneRef.current = false;
      });
  }, [startRecording]);

  const shouldRecord = isEnabled && isRunning && isSupported;

  // 녹음 effect보다 먼저 선언해, 코드 갱신으로 effect가 다시 실행돼도 최신 기록 여부를 먼저 맞춘다.
  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  useEffect(() => {
    desiredRef.current = shouldRecord ? { timeBoxIndex, team } : null;
    const active = activeRef.current;
    if (
      shouldRecord &&
      active &&
      active.segment.timeBoxIndex === timeBoxIndex &&
      active.segment.team === team
    ) {
      return;
    }
    stopRecording();
    if (!shouldRecord) {
      return;
    }
    const stream = streamRef.current;
    if (stream?.active) {
      startRecording(createSegmentKey(timeBoxIndex, team), stream);
      return;
    }
    reacquireMicrophone();
  }, [
    shouldRecord,
    timeBoxIndex,
    team,
    reacquireMicrophone,
    startRecording,
    stopRecording,
  ]);

  // 화면을 떠나면 녹음 중이던 구간까지 전사를 요청하고 마이크를 놓는다.
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      isEnabledRef.current = false;
      desiredRef.current = null;
      stopRecording();
      releaseMicrophone();
    };
  }, [releaseMicrophone, stopRecording]);

  // 페이지에서 처음 켤 때만 새 초안을 만들고, 껐다 켜면 이어서 기록한다.
  const enable = useCallback(async () => {
    if (!isSupported) {
      setError('unsupported');
      return;
    }
    try {
      if (!streamRef.current?.active) {
        const stream = await requestMicrophoneStream();
        // 권한을 묻는 사이 화면을 떠났으면 받은 마이크를 바로 놓는다.
        if (!isMountedRef.current) {
          stopMediaStream(stream);
          return;
        }
        streamRef.current = stream;
      }
    } catch {
      setError('not-allowed');
      return;
    }
    if (!hasStartedDraftRef.current) {
      startTranscriptDraft(tableIdRef.current, Date.now(), 'SONIOX');
      hasStartedDraftRef.current = true;
      setUtteranceCount(0);
      setFailedCount(0);
    }
    setError(null);
    setIsEnabled(true);
  }, [isSupported]);

  const disable = useCallback(() => {
    stopRecording();
    releaseMicrophone();
    setIsEnabled(false);
  }, [releaseMicrophone, stopRecording]);

  return {
    isSupported,
    isEnabled,
    isListening,
    utteranceCount,
    pendingCount,
    failedCount,
    error,
    enable,
    disable,
  };
}
