import { useState, useRef, useEffect } from 'react';
import { Formatting } from '../../../util/formatting';

export interface UseAudienceCountdownParams {
  receivedTime: number | null;
  isRunning: boolean;
}

export interface UseAudienceCountdownReturn {
  currentSeconds: number | null;
  formattedTime: string;
}

export function useAudienceCountdown({
  receivedTime,
  isRunning,
}: UseAudienceCountdownParams): UseAudienceCountdownReturn {
  const [currentSeconds, setCurrentSeconds] = useState<number | null>(
    receivedTime,
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // cleanup previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setCurrentSeconds(receivedTime);

    if (isRunning && receivedTime !== null) {
      targetTimeRef.current = Date.now() + receivedTime * 1000;

      intervalRef.current = setInterval(() => {
        if (targetTimeRef.current === null) return;
        const now = Date.now();
        const remainingTime = Math.ceil((targetTimeRef.current - now) / 1000);
        setCurrentSeconds(remainingTime);
      }, 200);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [receivedTime, isRunning]);

  const formattedTime =
    currentSeconds !== null
      ? `${currentSeconds < 0 ? '-' : ''}${Formatting.formatSecondsToMMSS(
          Math.abs(currentSeconds),
        )}`
      : '00:00';

  return { currentSeconds, formattedTime };
}
