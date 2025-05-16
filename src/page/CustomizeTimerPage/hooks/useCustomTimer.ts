import { useCallback, useRef, useState, useEffect } from 'react';

interface useCustomTimerProps {
  initIsSpeakingTimer?: boolean;
}

export function useCustomTimer({
  initIsSpeakingTimer = false,
}: useCustomTimerProps) {
  const [totalTimer, setTotalTimer] = useState<number | null>(null);
  const [isSpeakingTimer, setIsSpeakingTimer] = useState(initIsSpeakingTimer);
  const [speakingTimer, setSpeakingTimer] = useState<number | null>(null);
  const [defaultTime, setDefaultTime] = useState<{
    defaultTotalTimer: number | null;
    defaultSpeakingTimer: number | null;
  }>({ defaultTotalTimer: 0, defaultSpeakingTimer: null });

  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isDone, setIsDone] = useState(false);

  const [savedTime, setSavedTime] = useState<{
    savedTotalTimer: number | null;
    savedSpeakingTimer: number | null;
  }>({ savedTotalTimer: 0, savedSpeakingTimer: null });

  // 타이머 시작
  const startTimer = useCallback(() => {
    if (intervalRef.current !== null) return;
    if (!isDone) {
      intervalRef.current = setInterval(() => {
        setSavedTime((prev) => {
          return { ...prev, savedTotalTimer: totalTimer };
        });
        setTotalTimer((prev) =>
          prev === null ? null : prev - 1 >= 0 ? prev - 1 : 0,
        );
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

  // 타이머 일시정지
  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // 가장 최근의 시간정보로 타이머 리셋
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

  // 타이머 전환 간에 타이머를 초기화하는 함수
  const resetTimerForNextPhase = useCallback(() => {
    pauseTimer();
    if (
      isSpeakingTimer &&
      defaultTime.defaultSpeakingTimer !== null &&
      totalTimer !== null
    ) {
      setSpeakingTimer(
        defaultTime.defaultSpeakingTimer < totalTimer
          ? defaultTime.defaultSpeakingTimer
          : totalTimer,
      );
      if (totalTimer > 0) {
        setIsDone(false);
      }
      return;
    }
    if (totalTimer === 0) return;
    setTotalTimer(defaultTime.defaultTotalTimer);
  }, [
    defaultTime.defaultSpeakingTimer,
    defaultTime.defaultTotalTimer,
    isSpeakingTimer,
    totalTimer,
    pauseTimer,
  ]);

  // 특정 시간에 액션 수행
  const actOnTime = useCallback(
    (targetTime: number, action: () => void, isSpeakingTimer = false) => {
      const timer = isSpeakingTimer ? speakingTimer : totalTimer;
      if (timer === targetTime) {
        action();
      }
    },
    [totalTimer, speakingTimer],
  );

  // ✅ 외부에서 타이머를 재설정할 수 있는 Setter 제공
  const setTimers = useCallback(
    (total: number | null, speaking: number | null = null) => {
      pauseTimer();
      setTotalTimer(total);
      setSpeakingTimer(speaking);
    },
    [pauseTimer],
  );
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

  // Cleanup
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
    actOnTime,
    setTimers,
    setDefaultTime,
    setIsSpeakingTimer,
    setIsDone,
    clearTimer,
  };
}
