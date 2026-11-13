import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TimeBasedStance } from '../../../types/type';
import {
  getSpeechRecognitionConstructor,
  isFatalSpeechError,
  SpeechRecognitionConstructor,
  SpeechRecognitionEventLike,
  SpeechRecognitionLike,
} from '../../../util/speechRecognition';
import {
  appendUtterance,
  clearTranscriptDraft,
  isTranscriptDraftCurrent,
  TranscriptDraftContext,
  SegmentKey,
  startTranscriptDraft,
} from '../../../util/transcriptDraft';

export interface UseDebateTranscriberParams {
  tableId: number;
  timeBoxIndex: number;
  // 자유토론처럼 한 타임박스 안에서 발언 팀이 바뀌는 경우의 현재 팀
  team: TimeBasedStance | null;
  isRunning: boolean;
  lang: string;
}

export type TranscriberError = 'unsupported' | 'not-allowed' | 'recognition';

interface DesiredSegment {
  timeBoxIndex: number;
  team: TimeBasedStance | null;
}

interface RecognitionSession {
  recognition: SpeechRecognitionLike;
  segment: SegmentKey;
  isCurrent: boolean;
  context: TranscriptDraftContext;
}

const isSameSegment = (a: DesiredSegment, b: DesiredSegment) =>
  a.timeBoxIndex === b.timeBoxIndex && a.team === b.team;

let segmentSequence = 0;
const createSegmentKey = ({ timeBoxIndex, team }: DesiredSegment) => ({
  id: `${Date.now()}-${(segmentSequence += 1)}`,
  timeBoxIndex,
  team,
});

/**
 * 타이머가 실행되는 동안만 크롬 음성 인식을 켜고, 확정된 문장을 현재 타임박스 구간에 쌓는다.
 * 타이머 정지·라운드 이동·자유토론 팀 전환 시 인식을 끊어 구간을 나눈다.
 * 끊을 때는 stop으로 남은 확정 문장을 받은 뒤(onend) 다음 구간을 시작한다.
 */
export default function useDebateTranscriber(
  params: UseDebateTranscriberParams,
) {
  const { tableId, timeBoxIndex, team, isRunning, lang } = params;
  const RecognitionConstructor = useMemo<SpeechRecognitionConstructor | null>(
    () => getSpeechRecognitionConstructor(),
    [],
  );
  const isSupported = RecognitionConstructor !== null;

  const [isEnabled, setIsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [utteranceCount, setUtteranceCount] = useState(0);
  const [error, setError] = useState<TranscriberError | null>(null);

  const desiredRef = useRef<DesiredSegment | null>(null);
  const activeRef = useRef<RecognitionSession | null>(null);
  const draftContextRef = useRef<TranscriptDraftContext | null>(null);
  const tableIdRef = useRef(tableId);
  const langRef = useRef(lang);

  // 렌더 중에 ref를 바꾸면 커밋되지 않은 렌더 값이 남을 수 있어 커밋 뒤에 맞춘다.
  // 인식 세그먼트 effect보다 먼저 선언해 launch가 커밋된 최신 값을 읽게 한다.
  useEffect(() => {
    tableIdRef.current = tableId;
    langRef.current = lang;
  }, [tableId, lang]);

  const launch = useCallback(
    (segment: SegmentKey) => {
      const context = draftContextRef.current;
      if (
        !RecognitionConstructor ||
        !context ||
        !isTranscriptDraftCurrent(context)
      ) {
        return;
      }
      const recognition = new RecognitionConstructor();
      recognition.lang = langRef.current;
      recognition.continuous = true;
      // 인식 중인 문장은 화면에 보여주지 않으므로 확정 문장만 받는다.
      recognition.interimResults = false;
      const session: RecognitionSession = {
        recognition,
        segment,
        isCurrent: true,
        context,
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        if (!isTranscriptDraftCurrent(session.context)) {
          return;
        }
        Array.from(event.results)
          .slice(event.resultIndex)
          .filter((result) => result.isFinal)
          .map((result) => result[0].transcript)
          .filter((text) => text.trim() !== '')
          .forEach((text) => {
            appendUtterance(session.context, session.segment, text, Date.now());
            setUtteranceCount((prev) => prev + 1);
          });
      };

      recognition.onerror = (event) => {
        if (
          isFatalSpeechError(event.error) ||
          !['no-speech', 'aborted'].includes(event.error)
        ) {
          desiredRef.current = null;
          setError(
            isFatalSpeechError(event.error) ? 'not-allowed' : 'recognition',
          );
          setIsEnabled(false);
        }
      };

      recognition.onend = () => {
        if (activeRef.current === session) {
          activeRef.current = null;
        }
        const desired = desiredRef.current;
        if (!desired || !isTranscriptDraftCurrent(session.context)) {
          setIsListening(false);
          return;
        }
        // 같은 구간에서 크롬이 인식을 스스로 끝낸 경우 같은 구간으로 이어 간다.
        const nextSegment =
          session.isCurrent && isSameSegment(desired, session.segment)
            ? session.segment
            : createSegmentKey(desired);
        launch(nextSegment);
      };

      activeRef.current = session;
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        desiredRef.current = null;
        setError('recognition');
        setIsEnabled(false);
        setIsListening(false);
        activeRef.current = null;
      }
    },
    [RecognitionConstructor],
  );

  const shouldListen = isEnabled && isRunning && isSupported;

  useEffect(() => {
    const desired = shouldListen ? { timeBoxIndex, team } : null;
    desiredRef.current = desired;

    const active = activeRef.current;
    if (active) {
      if (
        desired &&
        active.isCurrent &&
        isSameSegment(desired, active.segment)
      ) {
        return;
      }
      // 남은 확정 문장은 기존 구간에 저장되고, 다음 구간은 onend에서 시작한다.
      active.isCurrent = false;
      active.recognition.stop();
      return;
    }

    if (desired) {
      launch(createSegmentKey(desired));
    }
  }, [shouldListen, timeBoxIndex, team, launch]);

  // 화면을 떠날 때 abort 대신 stop으로 끊어, 마지막으로 인식 중이던 문장도 초안에 남긴다.
  useEffect(() => {
    return () => {
      desiredRef.current = null;
      activeRef.current?.recognition.stop();
      activeRef.current = null;
    };
  }, []);

  // 페이지에서 처음 켤 때만 새 초안을 만들고, 껐다 켜면 이어서 기록한다.
  const enable = useCallback(
    (recognitionLanguage?: string) => {
      if (recognitionLanguage) {
        langRef.current = recognitionLanguage;
      }
      if (!isSupported) {
        setError('unsupported');
        return;
      }
      if (
        !draftContextRef.current ||
        !isTranscriptDraftCurrent(draftContextRef.current)
      ) {
        draftContextRef.current = startTranscriptDraft(
          tableIdRef.current,
          Date.now(),
        );
        setUtteranceCount(0);
      }
      setError(null);
      setIsEnabled(true);
    },
    [isSupported],
  );

  const disable = useCallback(() => {
    setIsEnabled(false);
  }, []);

  const discard = useCallback(() => {
    desiredRef.current = null;
    const active = activeRef.current;
    activeRef.current = null;
    if (active) {
      active.recognition.onresult = null;
      active.recognition.onend = null;
      active.recognition.onerror = null;
      active.recognition.abort();
    }
    if (draftContextRef.current) {
      clearTranscriptDraft(draftContextRef.current);
    }
    draftContextRef.current = null;
    setIsEnabled(false);
    setIsListening(false);
    setUtteranceCount(0);
    setError(null);
  }, []);

  return {
    discard,
    isSupported,
    isEnabled,
    isListening,
    utteranceCount,
    error,
    enable,
    disable,
  };
}
