import {
  useCallback,
  useRef,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react';

interface UseTimeBasedTimerProps {
  initIsSpeakingTimer?: boolean; // 처음에 발언 당 시간을 추가할지 여부
}

/**
 * 토론에서 사용하는 커스텀 타이머 훅
 * - 전체시간, 전체시간 + 발언 당 시간(2가지) 모드 지원
 */
export function useTimeBasedTimer({
  initIsSpeakingTimer = false,
}: UseTimeBasedTimerProps): TimeBasedTimerLogics {
  // 전체 남은 시간 (null이면 타이머 미사용)
  const [totalTimer, setTotalTimer] = useState<number | null>(null);
  // 발언당 시간 타이머(=각 phase별 제한시간, 모드 전환 가능)
  const [isSpeakingTimer, setIsSpeakingTimer] = useState(initIsSpeakingTimer);
  const [speakingTimer, setSpeakingTimer] = useState<number | null>(null);
  // 기본(초기) 시간값 (reset 등에서 참조)
  const [defaultTime, setDefaultTime] = useState<{
    defaultTotalTimer: number | null;
    defaultSpeakingTimer: number | null;
  }>({ defaultTotalTimer: 0, defaultSpeakingTimer: null });

  // 현재 타이머 동작중 여부
  const [isRunning, setIsRunning] = useState(false);
  // setInterval() 저장용 ref
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // 타이머가 0이 되면 true (완료 상태)
  const [isDone, setIsDone] = useState(false);

  // 리셋/롤백용: 최근 사용된(변경 직전) 값 저장
  const [savedTime, setSavedTime] = useState<{
    savedTotalTimer: number | null;
    savedSpeakingTimer: number | null;
  }>({ savedTotalTimer: 0, savedSpeakingTimer: null });

  /**
   * 타이머 카운트다운 시작
   * - 이미 실행 중이면 무시
   * - isDone(완료) 상태일 땐 시작X
   * - 1초마다 totalTimer, speakingTimer(필요시) 감소
   */
  const startTimer = useCallback(() => {
    if (intervalRef.current !== null) return;
    if (!isDone) {
      intervalRef.current = setInterval(() => {
        // 리셋용 현재값 저장(초 단위로 갱신)
        setSavedTime((prev) => {
          return { ...prev, savedTotalTimer: totalTimer };
        });
        // 전체 타이머 감소
        setTotalTimer((prev) =>
          prev === null ? null : prev - 1 >= 0 ? prev - 1 : 0,
        );
        // 발언 타이머 사용중이면 감소
        if (isSpeakingTimer) {
          setSavedTime((prev) => {
            return { ...prev, savedSpeakingTimer: speakingTimer };
          });
          setSpeakingTimer((prev) =>
            prev === null ? null : prev - 1 >= 0 ? prev - 1 : 0,
          );
        }
      }, 1000);
      setIsRunning(true);
    }
  }, [isDone, isSpeakingTimer, totalTimer, speakingTimer]);

  /**
   * 타이머 일시정지
   * - setInterval 해제, 동작 멈춤
   */
  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  /**
   * 최근 저장된 시간(savedTime)으로 복원
   */
  const resetCurrentTimer = useCallback(() => {
    pauseTimer();
    setIsDone(false);
    setTotalTimer(savedTime.savedTotalTimer);
    if (
      isSpeakingTimer &&
      defaultTime.defaultSpeakingTimer !== null &&
      totalTimer !== null
    ) {
      setSpeakingTimer(savedTime.savedSpeakingTimer);
    }
  }, [
    isSpeakingTimer,
    defaultTime.defaultSpeakingTimer,
    savedTime.savedTotalTimer,
    savedTime.savedSpeakingTimer,
    totalTimer,
    pauseTimer,
  ]);

  /**
   * 발언자 전환 시 타이머 리셋/초기화
   * - 발언 타이머 사용중이면 default값(또는 totalTimer 이하)로 재설정
   * - 전체 타이머는 초기값(defaultTotalTimer)로 리셋
   * - 상대 진영 전체 시간 소진 시, 남은 전체 시간을 speakingTimer에 전부 반영
   */
  const resetTimerForNextPhase = useCallback(
    (isOpponentDone: boolean) => {
      pauseTimer();
      if (
        isSpeakingTimer &&
        totalTimer !== null &&
        defaultTime.defaultSpeakingTimer !== null
      ) {
        if (isOpponentDone) {
          setSpeakingTimer(totalTimer);
        } else {
          setSpeakingTimer(
            defaultTime.defaultSpeakingTimer < totalTimer
              ? defaultTime.defaultSpeakingTimer
              : totalTimer,
          );
        }
        if (totalTimer > 0) {
          setIsDone(false);
        }
        return;
      }
      if (totalTimer === 0) return;
      setTotalTimer(defaultTime.defaultTotalTimer);
    },
    [
      defaultTime.defaultSpeakingTimer,
      defaultTime.defaultTotalTimer,
      isSpeakingTimer,
      totalTimer,
      pauseTimer,
    ],
  );

  /**
   * 외부에서 전체/발언 타이머를 지정값으로 재설정
   * - start/pause 후 원하는 값 지정할 때 사용
   */
  const setTimers = useCallback(
    (total: number | null, speaking: number | null = null) => {
      pauseTimer();
      setTotalTimer(total);
      setSpeakingTimer(speaking);
    },
    [pauseTimer],
  );

  /**
   * 타이머 상태값 모두 초기화 (clear)
   * - phase 전환 등 모든 값 리셋할 때 사용
   */
  const clearTimer = useCallback(() => {
    pauseTimer();
    setDefaultTime({ defaultTotalTimer: 0, defaultSpeakingTimer: null });
    setTotalTimer(null);
    setIsSpeakingTimer(initIsSpeakingTimer);
    setSpeakingTimer(null);
    setIsDone(false);
    intervalRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pauseTimer]);

  useEffect(() => () => pauseTimer(), [pauseTimer]);

  return {
    totalTimer,
    speakingTimer,
    isRunning,
    isDone,
    defaultTime,
    isSpeakingTimer,
    startTimer,
    pauseTimer,
    resetTimerForNextPhase,
    resetCurrentTimer,
    setTimers,
    setSavedTime,
    setDefaultTime,
    setIsSpeakingTimer,
    setIsDone,
    clearTimer,
  };
}

export interface TimeBasedTimerLogics {
  totalTimer: number | null;
  speakingTimer: number | null;
  isRunning: boolean;
  isDone: boolean;
  defaultTime: {
    defaultTotalTimer: number | null;
    defaultSpeakingTimer: number | null;
  };
  isSpeakingTimer: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimerForNextPhase: (isOpponentDone: boolean) => void;
  resetCurrentTimer: () => void;
  setTimers: (total: number | null, speaking?: number | null) => void;
  setSavedTime: Dispatch<
    SetStateAction<{
      savedTotalTimer: number | null;
      savedSpeakingTimer: number | null;
    }>
  >;
  setDefaultTime: Dispatch<
    SetStateAction<{
      defaultTotalTimer: number | null;
      defaultSpeakingTimer: number | null;
    }>
  >;
  setIsSpeakingTimer: Dispatch<SetStateAction<boolean>>;
  setIsDone: Dispatch<SetStateAction<boolean>>;
  clearTimer: () => void;
}
