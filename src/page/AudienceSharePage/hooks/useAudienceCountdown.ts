import { useState, useRef, useEffect } from 'react';
import { Formatting } from '../../../util/formatting';

export interface UseAudienceCountdownParams {
  receivedTime: number | null;
  isRunning: boolean;
  minimumTime?: number;
  shouldResetOnRunStateChange?: boolean;
  syncKey?: number;
}

export interface UseAudienceCountdownReturn {
  currentSeconds: number | null;
  formattedTime: string;
}

export function useAudienceCountdown({
  receivedTime,
  isRunning,
  minimumTime,
  shouldResetOnRunStateChange = true,
  syncKey,
}: UseAudienceCountdownParams): UseAudienceCountdownReturn {
  const [currentSeconds, setCurrentSeconds] = useState<number | null>(
    receivedTime,
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetTimeRef = useRef<number | null>(null);
  const currentSecondsRef = useRef<number | null>(receivedTime);
  const previousReceivedTimeRef = useRef<number | null | undefined>(undefined);
  const previousSyncKeyRef = useRef<number | undefined>(undefined);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const hasReceivedTimeChanged =
      previousReceivedTimeRef.current !== receivedTime;
    const hasSyncKeyChanged = previousSyncKeyRef.current !== syncKey;
    const shouldSynchronize =
      !isInitializedRef.current ||
      hasReceivedTimeChanged ||
      hasSyncKeyChanged ||
      shouldResetOnRunStateChange;
    const normalizedReceivedTime =
      receivedTime === null || minimumTime === undefined
        ? receivedTime
        : Math.max(minimumTime, receivedTime);
    const startingSeconds = shouldSynchronize
      ? normalizedReceivedTime
      : currentSecondsRef.current;

    if (shouldSynchronize) {
      currentSecondsRef.current = normalizedReceivedTime;
      setCurrentSeconds(normalizedReceivedTime);
    }

    previousReceivedTimeRef.current = receivedTime;
    previousSyncKeyRef.current = syncKey;
    isInitializedRef.current = true;

    const hasReachedMinimum =
      minimumTime !== undefined &&
      startingSeconds !== null &&
      startingSeconds <= minimumTime;

    if (isRunning && startingSeconds !== null && !hasReachedMinimum) {
      targetTimeRef.current = Date.now() + startingSeconds * 1000;

      intervalRef.current = setInterval(() => {
        if (targetTimeRef.current === null) return;
        const now = Date.now();
        const rawRemainingTime = Math.ceil(
          (targetTimeRef.current - now) / 1000,
        );
        const remainingTime =
          minimumTime === undefined
            ? rawRemainingTime
            : Math.max(minimumTime, rawRemainingTime);

        currentSecondsRef.current = remainingTime;
        setCurrentSeconds(remainingTime);

        if (
          minimumTime !== undefined &&
          rawRemainingTime <= minimumTime &&
          intervalRef.current
        ) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          targetTimeRef.current = null;
        }
      }, 200);
    } else {
      targetTimeRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    isRunning,
    minimumTime,
    receivedTime,
    shouldResetOnRunStateChange,
    syncKey,
  ]);

  const formattedTime =
    currentSeconds !== null
      ? `${currentSeconds < 0 ? '-' : ''}${Formatting.formatSecondsToMMSS(
          Math.abs(currentSeconds),
        )}`
      : '00:00';

  return { currentSeconds, formattedTime };
}
