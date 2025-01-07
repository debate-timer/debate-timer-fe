import { useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useThrottle = <T extends (...args: any[]) => void>(
  callback: T,
  throttleTime: number = 50,
): ((...args: Parameters<T>) => void) => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (...args: Parameters<T>) => {
    if (timer.current) return;

    callback(...args);
    timer.current = setTimeout(() => {
      timer.current = null;
    }, throttleTime);
  };
};

export default useThrottle;
