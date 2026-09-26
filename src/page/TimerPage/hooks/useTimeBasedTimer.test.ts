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

  describe('resetCurrentTimer', () => {
    function renderTimerWithTurnStartedAt(
      totalTimer: number,
      isOpponentDone = false,
    ) {
      const { result } = renderHook(() => useTimeBasedTimer());

      act(() => {
        result.current.setDefaultTime({
          defaultTotalTimer: 120,
          defaultSpeakingTimer: 30,
        });
        result.current.setTimers(totalTimer, 3);
      });
      act(() => {
        result.current.resetTimerForNextPhase(isOpponentDone);
      });

      return result;
    }

    it('진행 중 초기화하면 현재 턴을 시작했던 전체/발언 시간으로 되돌린다', () => {
      const result = renderTimerWithTurnStartedAt(94);

      act(() => {
        result.current.startTimer();
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(result.current.totalTimer).toBe(89);
      expect(result.current.speakingTimer).toBe(25);

      act(() => {
        result.current.resetCurrentTimer();
      });

      expect(result.current.totalTimer).toBe(94);
      expect(result.current.speakingTimer).toBe(30);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.getTurnStartTimes()).toEqual({
        totalTimer: 94,
        speakingTimer: 30,
      });
    });

    it('상대 팀 시간이 끝난 턴이면 남은 전체 시간을 발언 시간으로 되돌린다', () => {
      const result = renderTimerWithTurnStartedAt(94, true);

      act(() => {
        result.current.startTimer();
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      act(() => {
        result.current.resetCurrentTimer();
      });

      expect(result.current.totalTimer).toBe(94);
      expect(result.current.speakingTimer).toBe(94);
    });

    it('순서에 들어온 뒤 팀 전환 없이 초기화하면 설정값으로 되돌린다', () => {
      const { result } = renderHook(() => useTimeBasedTimer());

      act(() => {
        result.current.setDefaultTime({
          defaultTotalTimer: 120,
          defaultSpeakingTimer: 30,
        });
        result.current.setTimers(120, 30);
      });
      act(() => {
        result.current.startTimer();
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      act(() => {
        result.current.resetCurrentTimer();
      });

      expect(result.current.totalTimer).toBe(120);
      expect(result.current.speakingTimer).toBe(30);
    });
  });
});
