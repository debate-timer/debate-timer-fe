import { useState, useRef, useEffect } from 'react';
import { Formatting } from '../../../util/formatting';
import { MAX_NETWORK_DELAY_MS } from './getNetworkDelayMs';

// 기준 시각 이후 이 시간보다 오래 지났다면 네트워크 지연이 아닌 오래된 기준으로 보고 보정하지 않음
// (네트워크 지연 상한 + 렌더링 여유)
const MAX_SYNC_ELAPSED_MS = MAX_NETWORK_DELAY_MS + 1000;

/**
 * 수신값이 유효했던 시각(`syncedAt`)부터 지금까지 흐른 시간(ms)을 구합니다.
 * 기준 시각이 없거나, 미래이거나, 너무 오래되었으면 0을 반환합니다.
 */
function getSyncElapsedMs(syncedAt: number | null | undefined, now: number) {
  if (syncedAt === undefined || syncedAt === null) {
    return 0;
  }

  const elapsed = now - syncedAt;
  if (elapsed < 0 || elapsed > MAX_SYNC_ELAPSED_MS) {
    return 0;
  }

  return elapsed;
}

export interface UseAudienceCountdownParams {
  receivedTime: number | null;
  isRunning: boolean;
  minimumTime?: number;
  shouldResetOnRunStateChange?: boolean;
  syncKey?: number;
  /**
   * `receivedTime`이 유효했던 시각 (기기 시계 기준, epoch ms)
   * - 실행 중 동기화할 때 이 시각부터 흐른 시간만큼 빼고 카운트다운한다 (네트워크 지연 보정)
   */
  syncedAt?: number | null;
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
  syncedAt,
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

  // 기준 시각만 바뀌어 카운트다운을 다시 시작하지 않도록 ref로 읽음
  // (선언 순서대로 실행되므로 아래 effect보다 먼저 최신 값이 반영됨)
  const syncedAtRef = useRef(syncedAt);
  useEffect(() => {
    syncedAtRef.current = syncedAt;
  }, [syncedAt]);

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
      const now = Date.now();
      // 정지했던 값에서 재개할 때는 수신 이후 흐른 시간이 이미 반영되어 있으므로 보정하지 않음
      const elapsedMs = shouldSynchronize
        ? getSyncElapsedMs(syncedAtRef.current, now)
        : 0;
      targetTimeRef.current = now + startingSeconds * 1000 - elapsedMs;

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
