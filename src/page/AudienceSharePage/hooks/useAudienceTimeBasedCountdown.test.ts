import { act, renderHook } from '@testing-library/react';
import {
  getNextSpeakingTime,
  useAudienceTimeBasedCountdown,
} from './useAudienceTimeBasedCountdown';
import { AudienceTimeBasedDisplayData } from './EventInterpreter';

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

  it('네트워크 지연이 있는 재생에서도 전체 시간과 현재 시간이 같은 순간에 감소한다', () => {
    vi.setSystemTime(new Date('2026-09-27T00:00:00Z'));
    const { result, rerender } = renderHook(
      ({ displayData, syncedAt }) =>
        useAudienceTimeBasedCountdown({
          displayData,
          timePerTeam: 120,
          timePerSpeaking: 30,
          syncedAt,
        }),
      {
        initialProps: {
          displayData: createDisplayData({
            isRunning: false,
            eventType: 'STOP',
            prosTime: 30,
            revision: 1,
          }),
          syncedAt: Date.now() as number | null,
        },
      },
    );

    rerender({
      displayData: createDisplayData({
        isRunning: true,
        eventType: 'PLAY',
        prosTime: 30,
        revision: 2,
      }),
      syncedAt: Date.now() - 400,
    });

    for (let step = 0; step < 30; step += 1) {
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(
        (result.current.pros.totalRemainingTime ?? 0) -
          (result.current.pros.currentSpeakingRemainingTime ?? 0),
      ).toBe(90);
    }

    expect(result.current.pros.currentSpeakingRemainingTime).toBe(27);
    expect(result.current.pros.totalRemainingTime).toBe(117);
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

  it('설정 변경과 TEAM_SWITCH가 겹치면 새 팀 전체 시간을 새 설정값으로 표시한다', () => {
    const { result, rerender } = renderHook(
      ({ displayData, timePerTeam }) =>
        useAudienceTimeBasedCountdown({
          displayData,
          timePerTeam,
          timePerSpeaking: 30,
        }),
      {
        initialProps: {
          displayData: createDisplayData({
            currentTeam: 'CONS',
            isRunning: true,
            eventType: 'PLAY',
            prosTime: null,
            consTime: 30,
            revision: 1,
          }),
          timePerTeam: 120,
        },
      },
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.cons.totalRemainingTime).toBe(118);

    rerender({
      displayData: createDisplayData({
        currentTeam: 'CONS',
        isRunning: true,
        eventType: 'TEAM_SWITCH',
        prosTime: 30,
        consTime: null,
        sequence: 1,
        revision: 2,
      }),
      timePerTeam: 200,
    });

    expect(result.current.cons.totalRemainingTime).toBe(200);
    expect(result.current.cons.currentSpeakingRemainingTime).toBe(30);
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

  describe('SYNC', () => {
    it('중도 입장 시 양 팀 총 시간과 현재 팀 발언 시간으로 초기화하고 재생을 이어간다', () => {
      const { result } = renderHook(() =>
        useAudienceTimeBasedCountdown({
          displayData: createDisplayData({
            currentTeam: 'CONS',
            isRunning: true,
            eventType: 'SYNC',
            prosTime: null,
            consTime: 20,
            teamTotalTimes: { pros: 90, cons: 70 },
          }),
          timePerTeam: 120,
          timePerSpeaking: 30,
        }),
      );

      expect(result.current.pros.totalRemainingTime).toBe(90);
      expect(result.current.pros.currentSpeakingRemainingTime).toBe(30);
      expect(result.current.cons.totalRemainingTime).toBe(70);
      expect(result.current.cons.currentSpeakingRemainingTime).toBe(20);

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.cons.totalRemainingTime).toBe(68);
      expect(result.current.cons.currentSpeakingRemainingTime).toBe(18);
      expect(result.current.pros.totalRemainingTime).toBe(90);
    });

    it('실행 중 SYNC는 수신값이 유효했던 시각(syncedAt)부터 흐른 시간을 빼고 이어간다', () => {
      vi.setSystemTime(new Date('2026-09-23T00:00:00Z'));
      const syncedAt = Date.now() - 600;
      const { result } = renderHook(() =>
        useAudienceTimeBasedCountdown({
          displayData: createDisplayData({
            currentTeam: 'CONS',
            isRunning: true,
            eventType: 'SYNC',
            prosTime: null,
            consTime: 20,
            teamTotalTimes: { pros: 90, cons: 70 },
          }),
          timePerTeam: 120,
          timePerSpeaking: 30,
          syncedAt,
        }),
      );

      act(() => {
        vi.advanceTimersByTime(400);
      });

      // 보정하지 않으면 69.6초·19.6초가 남아 70·20으로 표시된다
      expect(result.current.cons.totalRemainingTime).toBe(69);
      expect(result.current.cons.currentSpeakingRemainingTime).toBe(19);
      expect(result.current.pros.totalRemainingTime).toBe(90);
    });

    it('정지 상태 SYNC는 받은 시간으로 멈춰 있는다', () => {
      const { result } = renderHook(() =>
        useAudienceTimeBasedCountdown({
          displayData: createDisplayData({
            currentTeam: 'PROS',
            isRunning: false,
            eventType: 'SYNC',
            prosTime: 15,
            consTime: null,
            teamTotalTimes: { pros: 50, cons: 60 },
          }),
          timePerTeam: 120,
          timePerSpeaking: 30,
        }),
      );

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.pros.totalRemainingTime).toBe(50);
      expect(result.current.pros.currentSpeakingRemainingTime).toBe(15);
      expect(result.current.pros.isRunning).toBe(false);
    });

    it('1회당 발언 시간이 없으면 양 팀 총 시간만 반영한다', () => {
      const { result } = renderHook(() =>
        useAudienceTimeBasedCountdown({
          displayData: createDisplayData({
            currentTeam: 'CONS',
            isRunning: false,
            eventType: 'SYNC',
            prosTime: null,
            consTime: 70,
            teamTotalTimes: { pros: 90, cons: 70 },
          }),
          timePerTeam: 120,
          timePerSpeaking: null,
        }),
      );

      expect(result.current.pros.totalRemainingTime).toBe(90);
      expect(result.current.cons.totalRemainingTime).toBe(70);
      expect(result.current.cons.currentSpeakingRemainingTime).toBeNull();
    });

    it('진행 중인 화면도 SYNC 값으로 보정한다', () => {
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

      rerender({
        displayData: createDisplayData({
          currentTeam: 'PROS',
          isRunning: true,
          eventType: 'SYNC',
          prosTime: 10,
          consTime: null,
          teamTotalTimes: { pros: 40, cons: 100 },
          revision: 2,
        }),
      });

      expect(result.current.pros.totalRemainingTime).toBe(40);
      expect(result.current.pros.currentSpeakingRemainingTime).toBe(10);
      expect(result.current.cons.totalRemainingTime).toBe(100);
    });
  });
});
