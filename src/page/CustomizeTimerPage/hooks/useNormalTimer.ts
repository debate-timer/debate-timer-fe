import { useCallback, useEffect, useRef, useState } from 'react';

export function useNormalTimer() {
  const [timer, setTimer] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [defaultTimer, setDefaultTimer] = useState(0);

  const [isRunning, setIsRunning] = useState(false);

  const startTimer = useCallback(() => {
    if (intervalRef.current !== null) return;
    intervalRef.current = setInterval(() => {
      setTimer((prev) => (prev === null ? null : prev - 1));
    }, 1000);
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(
    (value?: number) => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTimer(value !== undefined ? value : defaultTimer);
      setIsRunning(false);
    },
    [defaultTimer],
  );

  const actOnTime = useCallback(
    (time: number, act: () => void) => {
      if (timer === time) {
        act();
      }
    },
    [timer],
  );

  const clearTimer = useCallback(() => {
    pauseTimer();
    setTimer(null);
    setDefaultTimer(0);
    intervalRef.current = null;
  }, []);

  // Cleanup
  useEffect(() => () => pauseTimer(), [pauseTimer]);

  return {
    timer,
    isRunning,
    setTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    actOnTime,
    setDefaultTimer,
    clearTimer,
  };
}
