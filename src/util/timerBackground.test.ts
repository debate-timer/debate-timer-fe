import { describe, expect, it } from 'vitest';
import { getTimerStatusByTime } from './timerBackground';

describe('getTimerStatusByTime', () => {
  it.each([
    [31, 'default'],
    [30, 'warning'],
    [11, 'warning'],
    [10, 'danger'],
    [0, 'danger'],
    [-1, 'expired'],
  ] as const)('실행 중 남은 시간이 %i초면 %s이다', (time, expected) => {
    expect(getTimerStatusByTime(time, true)).toBe(expected);
  });

  it('실행 중이 아니면 남은 시간과 관계없이 default이다', () => {
    expect(getTimerStatusByTime(5, false)).toBe('default');
    expect(getTimerStatusByTime(-5, false)).toBe('default');
  });

  it('남은 시간이 없으면 default이다', () => {
    expect(getTimerStatusByTime(null, true)).toBe('default');
  });
});
