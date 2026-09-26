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
        result.current.setDefaultTime({
          defaultTotalTimer: 300,
          defaultSpeakingTimer: 60,
        });
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
        result.current.setDefaultTime({
          defaultTotalTimer: 30,
          defaultSpeakingTimer: 10,
        });
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
        result.current.setDefaultTime({
          defaultTotalTimer: 300,
          defaultSpeakingTimer: 60,
        });
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

  describe('1회당 발언 시간이 없는 순서', () => {
    it('앞 순서에서 발언 시간을 썼어도 전체 시간만 진행한다', () => {
      const { result } = renderHook(() => useTimeBasedTimer());

      // 앞 순서: 전체 2분 + 1회 발언 30초
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
        vi.advanceTimersByTime(3000);
      });

      // 다음 순서: 전체 1분만
      act(() => {
        result.current.clearTimer();
        result.current.setDefaultTime({
          defaultTotalTimer: 60,
          defaultSpeakingTimer: null,
        });
        result.current.setTimers(60, null);
      });
      act(() => {
        result.current.startTimer();
      });
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      let caughtUp: {
        totalTimer: number | null;
        speakingTimer: number | null;
      } = { totalTimer: null, speakingTimer: null };
      act(() => {
        caughtUp = result.current.catchUpToClock();
      });
      act(() => {
        result.current.pauseTimer();
      });

      expect(caughtUp).toEqual({ totalTimer: 58, speakingTimer: null });
      expect(result.current.totalTimer).toBe(58);
      expect(result.current.speakingTimer).toBeNull();
      expect(result.current.isSpeakingTimerAvailable).toBe(false);
    });

    it('초기화하면 턴을 시작했던 전체 시간으로 되돌린다', () => {
      const { result } = renderHook(() => useTimeBasedTimer());

      act(() => {
        result.current.setDefaultTime({
          defaultTotalTimer: 60,
          defaultSpeakingTimer: null,
        });
        result.current.setTimers(45, null);
      });
      act(() => {
        result.current.resetTimerForNextPhase(false);
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

      expect(result.current.totalTimer).toBe(45);
      expect(result.current.speakingTimer).toBeNull();
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
