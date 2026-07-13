import { act, renderHook } from '@testing-library/react';
import {
  getNextSpeakingTime,
  useAudienceTimeBasedCountdown,
} from './useAudienceTimeBasedCountdown';
import { AudienceTimeBasedDisplayData } from './useAudienceShareState';

function createDisplayData(
  overrides: Partial<AudienceTimeBasedDisplayData> = {},
): AudienceTimeBasedDisplayData {
  return {
    timerType: 'TIME_BASED',
    currentTeam: 'PROS',
    isRunning: false,
    prosTime: 30,
    consTime: null,
    sequence: 0,
    eventType: 'STOP',
    revision: 1,
    ...overrides,
  };
}

describe('getNextSpeakingTime', () => {
  it('상대 팀 전체 시간이 남으면 전체 잔여 시간과 1회당 시간 중 작은 값을 사용한다', () => {
    expect(
      getNextSpeakingTime({
        totalRemainingTime: 20,
        timePerSpeaking: 30,
        isOpponentTotalDone: false,
      }),
    ).toBe(20);
  });

  it('상대 팀 전체 시간이 끝나면 자신의 전체 잔여 시간을 모두 사용한다', () => {
    expect(
      getNextSpeakingTime({
        totalRemainingTime: 80,
        timePerSpeaking: 30,
        isOpponentTotalDone: true,
      }),
    ).toBe(80);
  });
});

describe('useAudienceTimeBasedCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('API 설정값으로 양 팀을 초기화하고 현재 팀의 두 시간만 함께 감소시킨다', () => {
    const { result } = renderHook(() =>
      useAudienceTimeBasedCountdown({
        displayData: createDisplayData({
          isRunning: true,
          eventType: 'PLAY',
          prosTime: 30,
        }),
        timePerTeam: 120,
        timePerSpeaking: 30,
      }),
    );

    expect(result.current.pros.totalRemainingTime).toBe(120);
    expect(result.current.pros.currentSpeakingRemainingTime).toBe(30);
    expect(result.current.cons.totalRemainingTime).toBe(120);
    expect(result.current.cons.currentSpeakingRemainingTime).toBe(30);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.pros.totalRemainingTime).toBe(118);
    expect(result.current.pros.currentSpeakingRemainingTime).toBe(28);
    expect(result.current.cons.totalRemainingTime).toBe(120);
    expect(result.current.cons.currentSpeakingRemainingTime).toBe(30);
  });

  it('정지 후 재생해도 전체 시간을 초기값으로 되돌리지 않는다', () => {
    const initial = createDisplayData({
      isRunning: true,
      eventType: 'PLAY',
      revision: 1,
    });
    const { result, rerender } = renderHook(
      ({ displayData }) =>
        useAudienceTimeBasedCountdown({
          displayData,
          timePerTeam: 120,
          timePerSpeaking: 30,
        }),
      { initialProps: { displayData: initial } },
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    rerender({
      displayData: createDisplayData({
        isRunning: false,
        eventType: 'STOP',
        prosTime: 28,
        revision: 2,
      }),
    });
    expect(result.current.pros.totalRemainingTime).toBe(118);

    rerender({
      displayData: createDisplayData({
        isRunning: true,
        eventType: 'PLAY',
        prosTime: 28,
        revision: 3,
      }),
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.pros.totalRemainingTime).toBe(117);
    expect(result.current.pros.currentSpeakingRemainingTime).toBe(27);
  });

  it('TEAM_SWITCH는 새 팀 현재 시간을 초기화하고 실행 상태를 유지한다', () => {
    const { result, rerender } = renderHook(
      ({ displayData }) =>
        useAudienceTimeBasedCountdown({
          displayData,
          timePerTeam: 120,
          timePerSpeaking: 30,
        }),
      {
        initialProps: {
          displayData: createDisplayData({
            isRunning: true,
            eventType: 'PLAY',
            revision: 1,
          }),
        },
      },
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    rerender({
      displayData: createDisplayData({
        currentTeam: 'CONS',
        isRunning: true,
        eventType: 'TEAM_SWITCH',
        prosTime: 28,
        revision: 2,
      }),
    });

    expect(result.current.pros.totalRemainingTime).toBe(118);
    expect(result.current.cons.currentSpeakingRemainingTime).toBe(30);
    expect(result.current.cons.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.cons.totalRemainingTime).toBe(119);
    expect(result.current.cons.currentSpeakingRemainingTime).toBe(29);
  });

  it('RESET은 현재 팀의 전체/현재 시간을 API 설정값으로 초기화한다', () => {
    const { result, rerender } = renderHook(
      ({ displayData }) =>
        useAudienceTimeBasedCountdown({
          displayData,
          timePerTeam: 120,
          timePerSpeaking: 30,
        }),
      {
        initialProps: {
          displayData: createDisplayData({
            isRunning: true,
            eventType: 'PLAY',
            revision: 1,
          }),
        },
      },
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    rerender({
      displayData: createDisplayData({
        isRunning: false,
        eventType: 'RESET',
        revision: 2,
      }),
    });

    expect(result.current.pros.totalRemainingTime).toBe(120);
    expect(result.current.pros.currentSpeakingRemainingTime).toBe(30);
    expect(result.current.pros.isRunning).toBe(false);
  });

  it('전체 시간 또는 현재 시간이 끝나면 0초에서 함께 정지한다', () => {
    const { result } = renderHook(() =>
      useAudienceTimeBasedCountdown({
        displayData: createDisplayData({
          isRunning: true,
          eventType: 'PLAY',
          prosTime: 2,
        }),
        timePerTeam: 10,
        timePerSpeaking: 2,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.pros.currentSpeakingRemainingTime).toBe(0);
    expect(result.current.pros.totalRemainingTime).toBe(8);
    expect(result.current.pros.isRunning).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.pros.totalRemainingTime).toBe(8);
  });

  it('1회당 발언 시간이 없으면 소켓의 전체 시간부터 0초까지 감소한다', () => {
    const { result } = renderHook(() =>
      useAudienceTimeBasedCountdown({
        displayData: createDisplayData({
          isRunning: true,
          eventType: 'PLAY',
          prosTime: 2,
        }),
        timePerTeam: 10,
        timePerSpeaking: null,
      }),
    );

    expect(result.current.pros.totalRemainingTime).toBe(2);
    expect(result.current.pros.currentSpeakingRemainingTime).toBeNull();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.pros.totalRemainingTime).toBe(0);
    expect(result.current.pros.isRunning).toBe(false);
  });
});
