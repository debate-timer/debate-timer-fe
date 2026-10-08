import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNormalTimer } from './useNormalTimer';

describe('useNormalTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-25T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('catchUpToClock', () => {
    it('인터벌이 밀려 있어도 실제 시각 기준 남은 시간으로 즉시 보정한다', () => {
      const { result } = renderHook(() => useNormalTimer());

      act(() => {
        result.current.setTimer(180);
      });
      act(() => {
        result.current.startTimer();
      });

      // 인터벌 콜백은 실행하지 않고 시각만 흐르게 해 백그라운드 억제 상황을 만든다
      vi.setSystemTime(new Date('2026-09-25T10:00:30Z'));
      expect(result.current.timer).toBe(180);

      let caughtUp: number | null = null;
      act(() => {
        caughtUp = result.current.catchUpToClock();
      });

      expect(caughtUp).toBe(150);
      expect(result.current.timer).toBe(150);
    });

    it('0초를 지난 뒤에는 초과 시간을 음수로 보정한다', () => {
      const { result } = renderHook(() => useNormalTimer());

      act(() => {
        result.current.setTimer(10);
      });
      act(() => {
        result.current.startTimer();
      });

      vi.setSystemTime(new Date('2026-09-25T10:00:15Z'));
      act(() => {
        result.current.catchUpToClock();
      });

      expect(result.current.timer).toBe(-5);
    });

    it('정지 상태에서는 현재 값을 그대로 돌려준다', () => {
      const { result } = renderHook(() => useNormalTimer());

      act(() => {
        result.current.setTimer(120);
      });

      vi.setSystemTime(new Date('2026-09-25T10:00:30Z'));

      let caughtUp: number | null = null;
      act(() => {
        caughtUp = result.current.catchUpToClock();
      });

      expect(caughtUp).toBe(120);
      expect(result.current.timer).toBe(120);
    });
  });
});
