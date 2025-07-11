// src/page/TimerPage/hooks/useTimerBackgroundState.ts

import { useEffect, useState } from 'react';
import { TimeBasedTimerLogics } from './useTimeBasedTimer';
import { NormalTimerLogics } from './useNormalTimer';
import { DebateTableData, TimeBasedStance } from '../../../type/type';
type TimerState = 'default' | 'warning' | 'danger' | 'expired';

const TIME_THRESHOLDS = {
  WARNING_MAX: 30,
  DANGER_MAX: 10,
  DANGER_MIN: 0,
} as const;

/**
 * 타이머 상태(색상)를 계산한다.
 * isRunning이 false면 항상 'default' 반환.
 */
function getTimerStatusByTime(
  time: number | null,
  isRunning: boolean,
): TimerState {
  if (!isRunning) return 'default';
  if (typeof time !== 'number') return 'default';
  if (time > TIME_THRESHOLDS.DANGER_MAX && time <= TIME_THRESHOLDS.WARNING_MAX)
    return 'warning';
  if (time >= TIME_THRESHOLDS.DANGER_MIN && time <= TIME_THRESHOLDS.DANGER_MAX)
    return 'danger';
  if (time < TIME_THRESHOLDS.DANGER_MIN) return 'expired';
  return 'default';
}
interface UseTimerBackgroundStateProps {
  timer1: TimeBasedTimerLogics;
  timer2: TimeBasedTimerLogics;
  normalTimer: NormalTimerLogics;
  prosConsSelected: TimeBasedStance;
  data: DebateTableData | undefined;
  index: number;
}

export function useTimerBackgroundState({
  timer1,
  timer2,
  normalTimer,
  prosConsSelected,
  data,
  index,
}: UseTimerBackgroundStateProps) {
  const [bg, setBg] = useState<TimerState>('default');

  useEffect(() => {
    const boxType = data?.table[index].boxType;

    if (boxType === 'NORMAL') {
      setBg(getTimerStatusByTime(normalTimer.timer, normalTimer.isRunning));
    } else if (boxType === 'TIME_BASED') {
      if (prosConsSelected === 'PROS') {
        const timer = timer1;
        setBg(
          getTimerStatusByTime(
            timer.speakingTimer ?? timer.totalTimer,
            timer.isRunning,
          ),
        );
      } else {
        const timer = timer2;
        setBg(
          getTimerStatusByTime(
            timer.speakingTimer ?? timer.totalTimer,
            timer.isRunning,
          ),
        );
      }
    } else {
      setBg('default');
    }
  }, [
    normalTimer.isRunning,
    normalTimer.timer,
    timer1.isRunning,
    timer1.speakingTimer,
    timer1.totalTimer,
    timer2.isRunning,
    timer2.speakingTimer,
    timer2.totalTimer,
    prosConsSelected,
    data,
    index,
    timer1,
    timer2,
  ]);

  return { bg, setBg };
}
