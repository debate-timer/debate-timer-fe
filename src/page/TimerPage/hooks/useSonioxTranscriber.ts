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

interface RecordingSession {
  recorder: MediaRecorder;
  segment: SegmentKey;
  startedAt: number;
  chunks: Blob[];
}

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
  const hasStartedDraftRef = useRef(false);
  const tableIdRef = useRef(tableId);
  const langRef = useRef(lang);
  tableIdRef.current = tableId;
  langRef.current = lang;

  const transcribe = useCallback((session: RecordingSession, audio: Blob) => {
    const currentTableId = tableIdRef.current;
    markSegmentPending(currentTableId, session.segment.id, Date.now());
    setPendingCount((prev) => prev + 1);
    postSonioxTranscription(audio, toAudioFileName(audio.type), langRef.current)
      .then(({ utterances }) => {
        appendSegmentUtterances(
          currentTableId,
          session.segment,
          session.startedAt,
          utterances,
        );
        setUtteranceCount((prev) => prev + utterances.length);
      })
      .catch(() => {
        failPendingSegment(currentTableId, session.segment.id);
        setFailedCount((prev) => prev + 1);
      })
      .finally(() => {
        setPendingCount((prev) => prev - 1);
      });
  }, []);

  const startRecording = useCallback(
    (segment: SegmentKey) => {
      const stream = streamRef.current;
      if (!stream) {
        return;
      }
      const mimeType = getRecorderMimeType();
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: RECORDER_AUDIO_BITS_PER_SECOND,
      });
      const session: RecordingSession = {
        recorder,
        segment,
        startedAt: Date.now(),
        chunks: [],
      };
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          session.chunks.push(event.data);
        }
      };
      recorder.onstop = () => {
        const audio = new Blob(session.chunks, {
          type: recorder.mimeType || mimeType || 'audio/webm',
        });
        if (audio.size > 0) {
          transcribe(session, audio);
        }
      };
      activeRef.current = session;
      recorder.start();
      setIsListening(true);
    },
    [transcribe],
  );

  // 녹음 중인 구간을 끝낸다. 남은 오디오는 onstop에서 전사 요청으로 이어진다.
  const stopRecording = useCallback(() => {
    const active = activeRef.current;
    activeRef.current = null;
    setIsListening(false);
    if (active && active.recorder.state !== 'inactive') {
      active.recorder.stop();
    }
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
      active.segment.timeBoxIndex === timeBoxIndex &&
      active.segment.team === team
    ) {
      return;
    }
    stopRecording();
    if (shouldRecord) {
      startRecording(createSegmentKey(timeBoxIndex, team));
    }
  }, [shouldRecord, timeBoxIndex, team, startRecording, stopRecording]);

  // 화면을 떠나면 녹음 중이던 구간까지 전사를 요청하고 마이크를 놓는다.
  useEffect(() => {
    return () => {
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
      streamRef.current ??= await requestMicrophoneStream();
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
