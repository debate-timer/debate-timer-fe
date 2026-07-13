import { describe, expect, it } from 'vitest';
import { getRemainingTimeForShare } from './getRemainingTimeForShare';

describe('getRemainingTimeForShare', () => {
  const normalTimer = 45;
  const prosTimer = {
    totalTimer: 120,
    speakingTimer: 30,
    isSpeakingTimerAvailable: true,
  };
  const consTimer = {
    totalTimer: 90,
    speakingTimer: null,
    isSpeakingTimerAvailable: false,
  };

  it('NORMAL은 일반 타이머의 잔여 시간을 반환한다', () => {
    expect(
      getRemainingTimeForShare({
        timerType: 'NORMAL',
        normalTimer,
        currentTeam: 'PROS',
        prosTimer,
        consTimer,
      }),
    ).toBe(45);
  });

  it('1회당 발언 시간이 있는 TIME_BASED는 선택 팀의 speakingTimer를 반환한다', () => {
    expect(
      getRemainingTimeForShare({
        timerType: 'TIME_BASED',
        normalTimer,
        currentTeam: 'PROS',
        prosTimer,
        consTimer,
      }),
    ).toBe(30);
  });

  it('1회당 발언 시간이 없는 TIME_BASED는 선택 팀의 totalTimer를 반환한다', () => {
    expect(
      getRemainingTimeForShare({
        timerType: 'TIME_BASED',
        normalTimer,
        currentTeam: 'CONS',
        prosTimer,
        consTimer,
      }),
    ).toBe(90);
  });
});
