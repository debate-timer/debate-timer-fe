import { useEffect, useEffectEvent, useRef } from 'react';

interface UseDocumentVisibilityOptions {
  throttleMs?: number;
  enabled?: boolean;
}

/**
 * 탭 복귀 시 최신 콜백을 실행해 소켓과 타이머 상태를 다시 맞춤.
 * @param onVisible 탭이 다시 보일 때 실행할 콜백
 * @param options 활성 여부와 재실행 제한 시간(ms), 기본값은 true와 1000임.
 */
export default function useDocumentVisibility(
  onVisible: () => void,
  options: UseDocumentVisibilityOptions = {},
) {
  const { throttleMs = 1000, enabled = true } = options;

  const handleVisible = useEffectEvent(onVisible);

  const lastRunAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      const now = Date.now();
      const lastRunAt = lastRunAtRef.current;
      if (lastRunAt !== null && now - lastRunAt < throttleMs) {
        return;
      }

      lastRunAtRef.current = now;
      handleVisible();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, throttleMs]);
}
