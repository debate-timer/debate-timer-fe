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

export type TranscriberError = 'unsupported' | 'not-allowed';

interface DesiredSegment {
  timeBoxIndex: number;
  team: TimeBasedStance | null;
}

interface RecognitionSession {
  recognition: SpeechRecognitionLike;
  segment: SegmentKey;
  isCurrent: boolean;
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
  const [interimText, setInterimText] = useState('');
  const [utteranceCount, setUtteranceCount] = useState(0);
  const [error, setError] = useState<TranscriberError | null>(null);

  const desiredRef = useRef<DesiredSegment | null>(null);
  const activeRef = useRef<RecognitionSession | null>(null);
  const hasStartedDraftRef = useRef(false);
  const tableIdRef = useRef(tableId);
  const langRef = useRef(lang);
  tableIdRef.current = tableId;
  langRef.current = lang;

  const launch = useCallback(
    (segment: SegmentKey) => {
      if (!RecognitionConstructor) {
        return;
      }
      const recognition = new RecognitionConstructor();
      recognition.lang = langRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      const session: RecognitionSession = {
        recognition,
        segment,
        isCurrent: true,
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        const results = Array.from(event.results).slice(event.resultIndex);
        const interim = results
          .filter((result) => !result.isFinal)
          .map((result) => result[0].transcript)
          .join('');
        results
          .filter((result) => result.isFinal)
          .map((result) => result[0].transcript)
          .filter((text) => text.trim() !== '')
          .forEach((text) => {
            appendUtterance(
              tableIdRef.current,
              session.segment,
              text,
              Date.now(),
            );
            setUtteranceCount((prev) => prev + 1);
          });
        if (session.isCurrent) {
          setInterimText(interim);
        }
      };

      recognition.onerror = (event) => {
        if (isFatalSpeechError(event.error)) {
          desiredRef.current = null;
          setError('not-allowed');
          setIsEnabled(false);
        }
      };

      recognition.onend = () => {
        if (activeRef.current === session) {
          activeRef.current = null;
        }
        const desired = desiredRef.current;
        if (!desired) {
          setIsListening(false);
          setInterimText('');
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
      setInterimText('');
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
  const enable = useCallback(() => {
    if (!isSupported) {
      setError('unsupported');
      return;
    }
    if (!hasStartedDraftRef.current) {
      startTranscriptDraft(tableIdRef.current, Date.now());
      hasStartedDraftRef.current = true;
      setUtteranceCount(0);
    }
    setError(null);
    setIsEnabled(true);
  }, [isSupported]);

  const disable = useCallback(() => {
    setIsEnabled(false);
  }, []);

  return {
    isSupported,
    isEnabled,
    isListening,
    interimText,
    utteranceCount,
    error,
    enable,
    disable,
  };
}
