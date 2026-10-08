import { useEffect, useRef } from 'react';

/**
 * 탭이 백그라운드에서 돌아올 때(`hidden` → `visible`) 콜백을 실행하는 훅입니다.
 *
 * 브라우저는 백그라운드 탭의 타이머와 네트워크를 억제하므로, 돌아온 시점에
 * 소켓 연결과 화면 상태를 다시 맞춰야 합니다.
 *
 * @param onVisible - 탭이 다시 보이게 되었을 때 실행할 콜백
 * @param options.throttleMs - 직전 실행 이후 이 시간 안에는 다시 실행하지 않습니다. (기본값 1000ms)
 * @param options.enabled - false면 아무것도 구독하지 않습니다. (기본값 true)
 */
interface UseDocumentVisibilityOptions {
  throttleMs?: number;
  enabled?: boolean;
}

export default function useDocumentVisibility(
  onVisible: () => void,
  options: UseDocumentVisibilityOptions = {},
) {
  const { throttleMs = 1000, enabled = true } = options;

  // 콜백이 매 렌더 새로 만들어져도 리스너를 다시 등록하지 않도록 ref로 읽는다
  const onVisibleRef = useRef(onVisible);
  useEffect(() => {
    onVisibleRef.current = onVisible;
  }, [onVisible]);

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
      onVisibleRef.current();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, throttleMs]);
}
