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

  it('0 아래에서도 음수로 카운트다운을 계속한다', () => {
    const { result } = renderHook(() =>
      useAudienceCountdown({ receivedTime: 1, isRunning: true }),
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.currentSeconds).toBe(-1);
    expect(result.current.formattedTime).toBe('-00:01');
  });

  it('최소 시간이 설정되면 해당 값에서 멈춘다', () => {
    const { result } = renderHook(() =>
      useAudienceCountdown({
        receivedTime: 1,
        isRunning: true,
        minimumTime: 0,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.currentSeconds).toBe(0);
    expect(result.current.formattedTime).toBe('00:00');
  });

  it('실행 상태 변경 시 초기화하지 않는 옵션은 정지한 값에서 재개한다', () => {
    const { result, rerender } = renderHook(
      (props) => useAudienceCountdown(props),
      {
        initialProps: {
          receivedTime: 10,
          isRunning: true,
          shouldResetOnRunStateChange: false,
        },
      },
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.currentSeconds).toBe(8);

    rerender({
      receivedTime: 10,
      isRunning: false,
      shouldResetOnRunStateChange: false,
    });
    expect(result.current.currentSeconds).toBe(8);

    rerender({
      receivedTime: 10,
      isRunning: true,
      shouldResetOnRunStateChange: false,
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.currentSeconds).toBe(7);
  });

  it('동일한 수신값도 syncKey가 변경되면 다시 동기화한다', () => {
    const { result, rerender } = renderHook(
      (props) => useAudienceCountdown(props),
      {
        initialProps: {
          receivedTime: 10,
          isRunning: true,
          shouldResetOnRunStateChange: false,
          syncKey: 1,
        },
      },
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.currentSeconds).toBe(8);

    rerender({
      receivedTime: 10,
      isRunning: false,
      shouldResetOnRunStateChange: false,
      syncKey: 2,
    });

    expect(result.current.currentSeconds).toBe(10);
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

  describe('네트워크 지연 보정 (syncedAt)', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2026-09-23T00:00:00Z'));
    });

    it('실행 중이면 수신값이 유효했던 시각부터 흐른 시간을 빼고 카운트다운한다', () => {
      const syncedAt = Date.now() - 600;
      const { result } = renderHook(() =>
        useAudienceCountdown({ receivedTime: 10, isRunning: true, syncedAt }),
      );

      act(() => {
        vi.advanceTimersByTime(400);
      });

      // 보정하지 않으면 9.6초가 남아 10으로 표시된다
      expect(result.current.currentSeconds).toBe(9);
    });

    it('정지 상태에서는 보정하지 않고 수신값을 그대로 표시한다', () => {
      const syncedAt = Date.now() - 600;
      const { result } = renderHook(() =>
        useAudienceCountdown({ receivedTime: 10, isRunning: false, syncedAt }),
      );

      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(result.current.currentSeconds).toBe(10);
    });

    it('기준 시각이 너무 오래되었으면 보정하지 않는다', () => {
      const syncedAt = Date.now() - 30_000;
      const { result } = renderHook(() =>
        useAudienceCountdown({ receivedTime: 10, isRunning: true, syncedAt }),
      );

      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(result.current.currentSeconds).toBe(10);
    });

    it('기준 시각이 미래이면 보정하지 않는다', () => {
      const syncedAt = Date.now() + 5_000;
      const { result } = renderHook(() =>
        useAudienceCountdown({ receivedTime: 10, isRunning: true, syncedAt }),
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.currentSeconds).toBe(9);
    });

    it('정지한 값에서 재개할 때는 기준 시각을 쓰지 않는다', () => {
      const syncedAt = Date.now() - 600;
      const { result, rerender } = renderHook(
        (props) => useAudienceCountdown(props),
        {
          initialProps: {
            receivedTime: 10,
            isRunning: true,
            syncedAt,
            shouldResetOnRunStateChange: false,
          },
        },
      );

      act(() => {
        vi.advanceTimersByTime(800);
      });
      expect(result.current.currentSeconds).toBe(9);

      rerender({
        receivedTime: 10,
        isRunning: false,
        syncedAt,
        shouldResetOnRunStateChange: false,
      });
      rerender({
        receivedTime: 10,
        isRunning: true,
        syncedAt,
        shouldResetOnRunStateChange: false,
      });
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current.currentSeconds).toBe(9);
    });

    it('기준 시각만 바뀌면 진행 중인 카운트다운을 다시 시작하지 않는다', () => {
      const { result, rerender } = renderHook(
        (props) => useAudienceCountdown(props),
        {
          initialProps: {
            receivedTime: 10,
            isRunning: true,
            syncedAt: Date.now(),
            shouldResetOnRunStateChange: false,
          },
        },
      );

      act(() => {
        vi.advanceTimersByTime(1100);
      });
      expect(result.current.currentSeconds).toBe(9);

      rerender({
        receivedTime: 10,
        isRunning: true,
        syncedAt: Date.now(),
        shouldResetOnRunStateChange: false,
      });
      act(() => {
        vi.advanceTimersByTime(950);
      });

      // 다시 시작했다면 표시값 9초에서 새로 세어 9로 남는다
      expect(result.current.currentSeconds).toBe(8);
    });
  });

  describe('실행 중 재동기화 튐 억제', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2026-09-23T00:00:00Z'));
    });

    const setupRunning = () =>
      renderHook((props) => useAudienceCountdown(props), {
        initialProps: {
          receivedTime: 10,
          isRunning: true,
          syncedAt: Date.now() as number | null,
        },
      });

    it('올림된 정수 초로 인한 1초 미만 차이는 기존 목표 시각을 유지한다', () => {
      const { result, rerender } = setupRunning();

      act(() => {
        vi.advanceTimersByTime(5300);
      });
      expect(result.current.currentSeconds).toBe(5);

      // 사회자 실제 잔여 4.7초 → 올림한 5초를 전송
      rerender({ receivedTime: 5, isRunning: true, syncedAt: Date.now() });
      act(() => {
        vi.advanceTimersByTime(800);
      });

      // 새 값으로 다시 맞췄다면 4.2초가 남아 5로 표시된다
      expect(result.current.currentSeconds).toBe(4);
    });

    it('1초 이상 어긋나면 받은 값으로 다시 맞춘다', () => {
      const { result, rerender } = setupRunning();

      act(() => {
        vi.advanceTimersByTime(5300);
      });

      rerender({ receivedTime: 7, isRunning: true, syncedAt: Date.now() });

      expect(result.current.currentSeconds).toBe(7);
      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(result.current.currentSeconds).toBe(7);
    });

    it('오차 범위 안에서 받은 값이 더 이르면 더 이른 목표 시각을 택한다', () => {
      const { result, rerender } = setupRunning();

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // 수신값이 600ms 전 기준 7초 → 목표 시각이 기존보다 600ms 이르다
      rerender({
        receivedTime: 7,
        isRunning: true,
        syncedAt: Date.now() - 600,
      });
      act(() => {
        vi.advanceTimersByTime(1400);
      });

      // 기존 목표 시각을 유지했다면 5.6초가 남아 6으로 표시된다
      expect(result.current.currentSeconds).toBe(5);
    });

    it('정지 후 재생은 오차 범위 안이어도 받은 값으로 시작한다', () => {
      const { result, rerender } = setupRunning();

      act(() => {
        vi.advanceTimersByTime(5300);
      });
      rerender({ receivedTime: 5, isRunning: false, syncedAt: Date.now() });
      rerender({ receivedTime: 5, isRunning: true, syncedAt: Date.now() });
      act(() => {
        vi.advanceTimersByTime(800);
      });

      expect(result.current.currentSeconds).toBe(5);
    });
  });
});
