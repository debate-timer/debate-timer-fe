import { TimeBasedStance, TimeBoxType } from '../../type/type';

interface ShareTimerState {
  totalTimer: number | null;
  speakingTimer: number | null;
  isSpeakingTimerAvailable: boolean;
}

interface GetRemainingTimeForShareParams {
  timerType: TimeBoxType | undefined;
  normalTimer: number | null;
  currentTeam: TimeBasedStance;
  prosTimer: ShareTimerState;
  consTimer: ShareTimerState;
}

export function getRemainingTimeForShare({
  timerType,
  normalTimer,
  currentTeam,
  prosTimer,
  consTimer,
}: GetRemainingTimeForShareParams) {
  if (timerType === 'NORMAL') {
    return normalTimer;
  }

  if (timerType !== 'TIME_BASED') {
    return null;
  }

  const currentTimer = currentTeam === 'PROS' ? prosTimer : consTimer;
  return currentTimer.isSpeakingTimerAvailable
    ? currentTimer.speakingTimer
    : currentTimer.totalTimer;
}
