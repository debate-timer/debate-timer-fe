import { useCallback, useRef, useState } from 'react';

export function useTimer() {
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [defaultTimer, setDefaultTimer] = useState(0);

  const [isRunning, setIsRunning] = useState(false);

  const startTimer = useCallback(() => {
    if (intervalRef.current === null) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      setIsRunning(true);
    }
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

  return {
    timer,
    isRunning,
    setTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    actOnTime,
    setDefaultValue: setDefaultTimer,
  };
}
