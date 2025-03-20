import { useCallback, useRef, useState, useEffect } from 'react';

interface useDebateTimerProps {
  initIsSpeakingTimer?: boolean;
}

export function useDebateTimer({
  initIsSpeakingTimer = false,
}: useDebateTimerProps) {
  const [totalTimer, setTotalTimer] = useState(0);
  const [isSpeakingTimer, setIsSpeakingTimer] = useState(initIsSpeakingTimer);
  const [speakingTimer, setSpeakingTimer] = useState(0);
  const [defaultTime, setDefaultTime] = useState<{
    defaultTotalTimer: number;
    defaultSpeakingTimer?: number;
  }>({ defaultTotalTimer: 0 });

  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 타이머 시작
  const startTimer = useCallback(() => {
    if (intervalRef.current !== null) return;

    intervalRef.current = setInterval(() => {
      setTotalTimer((prev) => Math.max(prev - 1, 0));
      if (isSpeakingTimer) {
        setSpeakingTimer((prev) => Math.max(prev - 1, 0));
      }
    }, 1000);
    setIsRunning(true);
  }, [isSpeakingTimer]);

  // 타이머 일시정지
  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // 타이머 리셋
  const resetTimer = useCallback(() => {
    pauseTimer();
    if (isSpeakingTimer) {
      setSpeakingTimer(defaultTime.defaultSpeakingTimer ?? 0);
      return;
    }

    setSpeakingTimer(defaultTime.defaultTotalTimer);
  }, [
    defaultTime.defaultSpeakingTimer,
    defaultTime.defaultTotalTimer,
    isSpeakingTimer,
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
    (total: number, speaking?: number) => {
      pauseTimer();
      setTotalTimer(total);
      setSpeakingTimer(speaking ?? 0);
    },
    [pauseTimer],
  );

  // Cleanup
  useEffect(() => () => pauseTimer(), [pauseTimer]);

  return {
    totalTimer,
    speakingTimer,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    actOnTime,
    setTimers,
    setDefaultTime,
    setIsSpeakingTimer,
  };
}
