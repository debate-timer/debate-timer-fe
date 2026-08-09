import { useEffect, useState } from 'react';

/**
 * 값의 변경이 delay(ms) 동안 멈추면(= 입력이 끝났다고 판단되면) 갱신되는 디바운스 값을 반환한다.
 * 입력 중에는 이전 값을 유지하므로, 타이핑 도중이 아니라 입력이 마쳤을 때 검증을 트리거하는 데 사용한다.
 */
const useDebounce = <T>(value: T, delay = 400): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
