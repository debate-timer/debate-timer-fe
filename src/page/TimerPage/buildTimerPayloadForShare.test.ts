import { describe, expect, it } from 'vitest';
import { buildTimerPayloadForShare } from './buildTimerPayloadForShare';

describe('buildTimerPayloadForShare', () => {
  const normalParams = {
    timerType: 'NORMAL' as const,
    sequence: 2,
    currentTeam: 'PROS' as const,
    remainingTime: 142,
    isCurrentTimerRunning: true,
    prosTotalTime: null,
    consTotalTime: null,
  };

  const timeBasedParams = {
    timerType: 'TIME_BASED' as const,
    sequence: 0,
    currentTeam: 'CONS' as const,
    remainingTime: 20,
    isCurrentTimerRunning: false,
    prosTotalTime: 40,
    consTotalTime: 50,
  };

  it('일반 타이머 SYNC는 현재 재생 여부를 담는다', () => {
    expect(
      buildTimerPayloadForShare({ ...normalParams, eventType: 'SYNC' }),
    ).toEqual({
      timerType: 'NORMAL',
      sequence: 2,
      remainingTime: 142,
      isRunning: true,
    });
  });

  it('자유토론 SYNC는 현재 팀과 양 팀의 총 남은 시간을 담는다', () => {
    expect(
      buildTimerPayloadForShare({ ...timeBasedParams, eventType: 'SYNC' }),
    ).toEqual({
      timerType: 'TIME_BASED',
      sequence: 0,
      currentTeam: 'CONS',
      remainingTime: 20,
      isRunning: false,
      prosRemainingTime: 40,
      consRemainingTime: 50,
    });
  });

  it('자유토론 SYNC에서 팀 총 시간을 알 수 없으면 null을 반환한다', () => {
    expect(
      buildTimerPayloadForShare({
        ...timeBasedParams,
        eventType: 'SYNC',
        prosTotalTime: null,
      }),
    ).toBeNull();
  });

  it('PLAY는 상태 반영 전이라도 재생 중으로 보낸다', () => {
    expect(
      buildTimerPayloadForShare({
        ...normalParams,
        eventType: 'PLAY',
        isCurrentTimerRunning: false,
      })?.isRunning,
    ).toBe(true);
  });

  it.each(['STOP', 'RESET', 'NEXT', 'BEFORE'] as const)(
    '%s는 정지 상태로 보낸다',
    (eventType) => {
      expect(
        buildTimerPayloadForShare({ ...normalParams, eventType })?.isRunning,
      ).toBe(false);
    },
  );

  it('TEAM_SWITCH는 현재 타이머의 재생 여부를 따른다', () => {
    expect(
      buildTimerPayloadForShare({
        ...timeBasedParams,
        eventType: 'TEAM_SWITCH',
        isCurrentTimerRunning: true,
      })?.isRunning,
    ).toBe(true);
  });

  it('남은 시간이나 타이머 유형을 알 수 없으면 null을 반환한다', () => {
    expect(
      buildTimerPayloadForShare({
        ...normalParams,
        eventType: 'SYNC',
        remainingTime: null,
      }),
    ).toBeNull();

    expect(
      buildTimerPayloadForShare({
        ...normalParams,
        eventType: 'SYNC',
        timerType: 'FEEDBACK',
      }),
    ).toBeNull();

    expect(
      buildTimerPayloadForShare({
        ...normalParams,
        eventType: 'SYNC',
        timerType: undefined,
      }),
    ).toBeNull();
  });
});
