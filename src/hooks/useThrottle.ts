import { useCallback, useRef } from 'react';

/** 지정한 간격으로 콜백 호출을 제한하는 스로틀 훅. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  throttleTime: number = 50,
): (...args: Parameters<T>) => void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) {
        return;
      }

      callback(...args);
      timer.current = setTimeout(() => {
        timer.current = null;
      }, throttleTime);
    },
    [callback, throttleTime],
  );
}
