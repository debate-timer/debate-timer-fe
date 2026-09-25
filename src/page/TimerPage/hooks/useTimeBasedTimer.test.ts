import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTimeBasedTimer } from './useTimeBasedTimer';

describe('useTimeBasedTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-25T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('catchUpToClock', () => {
    it('인터벌이 밀려 있어도 전체/발언 남은 시간을 실제 시각 기준으로 보정한다', () => {
      const { result } = renderHook(() => useTimeBasedTimer());

      act(() => {
        result.current.setTimers(300, 60);
      });
      act(() => {
        result.current.startTimer();
      });

      // 인터벌 콜백은 실행하지 않고 시각만 흐르게 해 백그라운드 억제 상황을 만든다
      vi.setSystemTime(new Date('2026-09-25T10:00:20Z'));
      expect(result.current.totalTimer).toBe(300);

      act(() => {
        result.current.catchUpToClock();
      });

      expect(result.current.totalTimer).toBe(280);
      expect(result.current.speakingTimer).toBe(40);
    });

    it('시간이 다 지나면 0으로 보정한다', () => {
      const { result } = renderHook(() => useTimeBasedTimer());

      act(() => {
        result.current.setTimers(30, 10);
      });
      act(() => {
        result.current.startTimer();
      });

      vi.setSystemTime(new Date('2026-09-25T10:01:00Z'));
      act(() => {
        result.current.catchUpToClock();
      });

      expect(result.current.totalTimer).toBe(0);
      expect(result.current.speakingTimer).toBe(0);
    });

    it('정지 상태에서는 현재 값을 그대로 돌려준다', () => {
      const { result } = renderHook(() => useTimeBasedTimer());

      act(() => {
        result.current.setTimers(300, 60);
      });

      vi.setSystemTime(new Date('2026-09-25T10:00:20Z'));

      let caughtUp: {
        totalTimer: number | null;
        speakingTimer: number | null;
      } = { totalTimer: null, speakingTimer: null };
      act(() => {
        caughtUp = result.current.catchUpToClock();
      });

      expect(caughtUp).toEqual({ totalTimer: 300, speakingTimer: 60 });
      expect(result.current.totalTimer).toBe(300);
    });
  });
});
