import { describe, it, expect } from 'vitest';
import { isSocketMessage } from './util';

describe('isSocketMessage', () => {
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
});
