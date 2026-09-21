import { describe, it, expect } from 'vitest';
import { isSocketMessage } from './util';

describe('소켓 메시지 여부 검증', () => {
  it('유효한 모든 타이머 이벤트 메시지는 런타임 검증을 통과한다', () => {
    expect(
      isSocketMessage({
        eventType: 'PLAY',
        data: {
          timerType: 'NORMAL',
          sequence: 1,
          remainingTime: 10,
        },
      }),
    ).toBe(true);

    expect(
      isSocketMessage({
        eventType: 'NEXT',
        data: {
          timerType: 'TIME_BASED',
          sequence: 0,
          currentTeam: 'PROS',
          remainingTime: 300,
        },
      }),
    ).toBe(true);
  });

  it('FINISHED와 ERROR는 data가 null일 때만 런타임 검증을 통과한다', () => {
    expect(
      isSocketMessage({
        eventType: 'FINISHED',
        data: null,
      }),
    ).toBe(true);

    expect(
      isSocketMessage({
        eventType: 'ERROR',
        data: null,
      }),
    ).toBe(true);
  });

  it('잘못된 이벤트 값, 페이로드 타입, CUSTOMIZE 타이머 타입은 런타임 검증에서 거부된다', () => {
    // Missing eventType
    expect(isSocketMessage({ data: null })).toBe(false);
    // Unknown eventType
    expect(isSocketMessage({ eventType: 'UNKNOWN', data: null })).toBe(false);

    // Timer event with data: null
    expect(
      isSocketMessage({
        eventType: 'PLAY',
        data: null,
      }),
    ).toBe(false);

    // Non-timer event with non-null data
    expect(
      isSocketMessage({
        eventType: 'FINISHED',
        data: {
          timerType: 'NORMAL',
          sequence: 1,
          remainingTime: 10,
        },
      }),
    ).toBe(false);

    // CUSTOMIZE timerType
    expect(
      isSocketMessage({
        eventType: 'PLAY',
        data: {
          timerType: 'CUSTOMIZE',
          sequence: 1,
          remainingTime: 10,
        },
      }),
    ).toBe(false);

    // Invalid sequence (e.g. NaN, string)
    expect(
      isSocketMessage({
        eventType: 'PLAY',
        data: {
          timerType: 'NORMAL',
          sequence: NaN,
          remainingTime: 10,
        },
      }),
    ).toBe(false);

    expect(
      isSocketMessage({
        eventType: 'PLAY',
        data: {
          timerType: 'NORMAL',
          sequence: '1',
          remainingTime: 10,
        },
      }),
    ).toBe(false);

    // Invalid remainingTime
    expect(
      isSocketMessage({
        eventType: 'PLAY',
        data: {
          timerType: 'NORMAL',
          sequence: 1,
          remainingTime: Infinity,
        },
      }),
    ).toBe(false);
  });

  it('currentTeam은 누락되거나 PROS 또는 CONS일 때만 허용되며 NEUTRAL은 런타임 검증에서 거부된다', () => {
    // Missing currentTeam is valid
    expect(
      isSocketMessage({
        eventType: 'PLAY',
        data: {
          timerType: 'NORMAL',
          sequence: 1,
          remainingTime: 10,
        },
      }),
    ).toBe(true);

    // PROS is valid
    expect(
      isSocketMessage({
        eventType: 'PLAY',
        data: {
          timerType: 'NORMAL',
          sequence: 1,
          remainingTime: 10,
          currentTeam: 'PROS',
        },
      }),
    ).toBe(true);

    // CONS is valid
    expect(
      isSocketMessage({
        eventType: 'PLAY',
        data: {
          timerType: 'NORMAL',
          sequence: 1,
          remainingTime: 10,
          currentTeam: 'CONS',
        },
      }),
    ).toBe(true);

    // NEUTRAL is invalid
    expect(
      isSocketMessage({
        eventType: 'PLAY',
        data: {
          timerType: 'NORMAL',
          sequence: 1,
          remainingTime: 10,
          currentTeam: 'NEUTRAL',
        },
      }),
    ).toBe(false);

    // Random string is invalid
    expect(
      isSocketMessage({
        eventType: 'PLAY',
        data: {
          timerType: 'NORMAL',
          sequence: 1,
          remainingTime: 10,
          currentTeam: 'INVALID',
        },
      }),
    ).toBe(false);
  });

  describe('SYNC 이벤트', () => {
    it('일반 타이머 SYNC는 isRunning이 boolean일 때 통과한다', () => {
      expect(
        isSocketMessage({
          eventType: 'SYNC',
          data: {
            timerType: 'NORMAL',
            sequence: 2,
            remainingTime: 142,
            isRunning: true,
          },
        }),
      ).toBe(true);
    });

    it('SYNC에 isRunning이 없거나 boolean이 아니면 거부된다', () => {
      expect(
        isSocketMessage({
          eventType: 'SYNC',
          data: { timerType: 'NORMAL', sequence: 2, remainingTime: 142 },
        }),
      ).toBe(false);

      expect(
        isSocketMessage({
          eventType: 'SYNC',
          data: {
            timerType: 'NORMAL',
            sequence: 2,
            remainingTime: 142,
            isRunning: 'true',
          },
        }),
      ).toBe(false);
    });

    it('자유토론 SYNC는 양 팀 남은 시간이 모두 있어야 통과한다', () => {
      const data = {
        timerType: 'TIME_BASED',
        sequence: 0,
        currentTeam: 'CONS',
        remainingTime: 20,
        isRunning: false,
        prosRemainingTime: 40,
        consRemainingTime: 50,
      };

      expect(isSocketMessage({ eventType: 'SYNC', data })).toBe(true);
      expect(
        isSocketMessage({
          eventType: 'SYNC',
          data: { ...data, prosRemainingTime: undefined },
        }),
      ).toBe(false);
      expect(
        isSocketMessage({
          eventType: 'SYNC',
          data: { ...data, consRemainingTime: Number.NaN },
        }),
      ).toBe(false);
    });
  });

  describe('부가 필드 검증', () => {
    it('서버가 채운 null 부가 필드는 값이 없는 것으로 보고 통과한다', () => {
      expect(
        isSocketMessage({
          eventType: 'PLAY',
          version: 2000,
          data: {
            timerType: 'NORMAL',
            currentTeam: null,
            sequence: 0,
            remainingTime: 100,
            isRunning: true,
            prosRemainingTime: null,
            consRemainingTime: null,
          },
        }),
      ).toBe(true);
    });

    it('SYNC의 isRunning이 null이면 거부된다', () => {
      expect(
        isSocketMessage({
          eventType: 'SYNC',
          data: {
            timerType: 'NORMAL',
            sequence: 0,
            remainingTime: 100,
            isRunning: null,
          },
        }),
      ).toBe(false);
    });

    it('자유토론 SYNC의 팀 시간이 null이면 거부된다', () => {
      expect(
        isSocketMessage({
          eventType: 'SYNC',
          data: {
            timerType: 'TIME_BASED',
            currentTeam: 'PROS',
            sequence: 0,
            remainingTime: 10,
            isRunning: false,
            prosRemainingTime: 10,
            consRemainingTime: null,
          },
        }),
      ).toBe(false);
    });

    it('SYNC 외 이벤트는 isRunning과 팀별 남은 시간이 없어도 통과한다', () => {
      expect(
        isSocketMessage({
          eventType: 'STOP',
          data: { timerType: 'NORMAL', sequence: 1, remainingTime: 10 },
        }),
      ).toBe(true);
    });

    it('SYNC 외 이벤트라도 부가 필드의 타입이 잘못되면 거부된다', () => {
      expect(
        isSocketMessage({
          eventType: 'STOP',
          data: {
            timerType: 'NORMAL',
            sequence: 1,
            remainingTime: 10,
            isRunning: 1,
          },
        }),
      ).toBe(false);

      expect(
        isSocketMessage({
          eventType: 'TEAM_SWITCH',
          data: {
            timerType: 'TIME_BASED',
            sequence: 0,
            currentTeam: 'PROS',
            remainingTime: 10,
            prosRemainingTime: '10',
          },
        }),
      ).toBe(false);
    });
  });

  describe('version 검증', () => {
    it('version이 유한한 숫자이면 통과한다', () => {
      expect(
        isSocketMessage({ eventType: 'FINISHED', data: null, version: 3 }),
      ).toBe(true);
    });

    it('version이 없으면 하위 호환을 위해 통과한다', () => {
      expect(isSocketMessage({ eventType: 'FINISHED', data: null })).toBe(true);
    });

    it('서버가 보낸 version: null은 값이 없는 것으로 보고 통과한다', () => {
      expect(
        isSocketMessage({ eventType: 'FINISHED', data: null, version: null }),
      ).toBe(true);
    });

    it('version이 숫자가 아니거나 유한하지 않으면 거부된다', () => {
      expect(
        isSocketMessage({ eventType: 'FINISHED', data: null, version: '3' }),
      ).toBe(false);
      expect(
        isSocketMessage({
          eventType: 'PLAY',
          data: { timerType: 'NORMAL', sequence: 1, remainingTime: 10 },
          version: Number.POSITIVE_INFINITY,
        }),
      ).toBe(false);
    });
  });
});
