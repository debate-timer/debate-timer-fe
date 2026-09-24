import { TimerBGState } from '../type/type';

const TIME_THRESHOLDS = {
  WARNING_MAX: 30,
  DANGER_MAX: 10,
  DANGER_MIN: 0,
} as const;

/**
 * 남은 시간(초)에 따른 타이머 배경 상태를 계산한다.
 * - 30초 ~ 11초: `warning` (노란색)
 * - 10초 ~ 0초: `danger` (붉은색)
 * - 0초 미만: `expired` (회색)
 * isRunning이 false면 항상 'default' 반환.
 */
export function getTimerStatusByTime(
  time: number | null,
  isRunning: boolean,
): TimerBGState {
  if (!isRunning) return 'default';
  if (typeof time !== 'number') return 'default';
  if (time > TIME_THRESHOLDS.DANGER_MAX && time <= TIME_THRESHOLDS.WARNING_MAX)
    return 'warning';
  if (time >= TIME_THRESHOLDS.DANGER_MIN && time <= TIME_THRESHOLDS.DANGER_MAX)
    return 'danger';
  if (time < TIME_THRESHOLDS.DANGER_MIN) return 'expired';
  return 'default';
}
