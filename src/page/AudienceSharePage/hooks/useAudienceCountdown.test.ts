import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useAudienceCountdown } from './useAudienceCountdown';

describe('useAudienceCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('초기 수신값 표시', () => {
    const { result } = renderHook(() =>
      useAudienceCountdown({ receivedTime: 65, isRunning: false }),
    );

    expect(result.current.currentSeconds).toBe(65);
    expect(result.current.formattedTime).toBe('01:05');
  });

  it('실행 중 시간 감소', () => {
    const { result } = renderHook(() =>
      useAudienceCountdown({ receivedTime: 10, isRunning: true }),
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.currentSeconds).toBe(9);
    expect(result.current.formattedTime).toBe('00:09');
  });

  it('정지 상태 유지', () => {
    const { result } = renderHook(() =>
      useAudienceCountdown({ receivedTime: 10, isRunning: false }),
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.currentSeconds).toBe(10);
  });

  it('새 수신값 재동기화', () => {
    const { result, rerender } = renderHook(
      (props) => useAudienceCountdown(props),
      { initialProps: { receivedTime: 10, isRunning: true } },
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.currentSeconds).toBe(8);

    rerender({ receivedTime: 15, isRunning: true });
    expect(result.current.currentSeconds).toBe(15);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.currentSeconds).toBe(14);
  });

  it('0 아래로 내려가지 않음', () => {
    const { result } = renderHook(() =>
      useAudienceCountdown({ receivedTime: 1, isRunning: true }),
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.currentSeconds).toBe(0);
    expect(result.current.formattedTime).toBe('00:00');
  });

  it('입력 변경과 언마운트 시 interval 정리', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    // 언마운트 시 정리 확인
    const hook1 = renderHook((props) => useAudienceCountdown(props), {
      initialProps: { receivedTime: 10, isRunning: true },
    });
    hook1.unmount();
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);

    clearIntervalSpy.mockClear();

    // 입력 변경(isRunning false) 시 정리 확인
    const hook2 = renderHook((props) => useAudienceCountdown(props), {
      initialProps: { receivedTime: 10, isRunning: true },
    });
    hook2.rerender({ receivedTime: 10, isRunning: false });
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
  });
});
