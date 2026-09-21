import { TimerDataPayload, TimerEventTypes } from '../../apis/sockets/type';
import { TimeBasedStance, TimeBoxType } from '../../type/type';

interface BuildTimerPayloadForShareParams {
  eventType: TimerEventTypes;
  timerType: TimeBoxType | undefined;
  sequence: number;
  currentTeam: TimeBasedStance;
  remainingTime: number | null;
  isCurrentTimerRunning: boolean;
  prosTotalTime: number | null;
  consTotalTime: number | null;
}

/**
 * 이벤트 발행 시점의 재생 여부를 결정합니다.
 * 이벤트 핸들러는 타이머 조작 직후 호출되어 React 상태가 아직 이전 값이므로,
 * 재생 여부가 확정되는 이벤트는 이벤트 유형으로 판단합니다.
 */
function resolveIsRunning(
  eventType: TimerEventTypes,
  isCurrentTimerRunning: boolean,
): boolean {
  switch (eventType) {
    case 'PLAY':
      return true;
    case 'STOP':
    case 'RESET':
    case 'NEXT':
    case 'BEFORE':
      return false;
    case 'TEAM_SWITCH':
    case 'SYNC':
      return isCurrentTimerRunning;
  }
}

/**
 * 사회자가 청중에게 공유할 타이머 이벤트 페이로드를 만듭니다.
 * 공유할 수 없는 상태(피드백 타이머, 남은 시간 미확정 등)이면 `null`을 반환합니다.
 */
export function buildTimerPayloadForShare({
  eventType,
  timerType,
  sequence,
  currentTeam,
  remainingTime,
  isCurrentTimerRunning,
  prosTotalTime,
  consTotalTime,
}: BuildTimerPayloadForShareParams): TimerDataPayload | null {
  if (remainingTime === null) {
    return null;
  }

  const isRunning = resolveIsRunning(eventType, isCurrentTimerRunning);

  if (timerType === 'NORMAL') {
    return {
      timerType,
      sequence,
      remainingTime,
      isRunning,
    };
  }

  if (timerType !== 'TIME_BASED') {
    return null;
  }

  // 중도 입장한 청중은 상대 팀 시간을 알 수 없으므로 SYNC에는 양 팀 시간이 필수
  if (
    eventType === 'SYNC' &&
    (prosTotalTime === null || consTotalTime === null)
  ) {
    return null;
  }

  return {
    timerType,
    sequence,
    currentTeam,
    remainingTime,
    isRunning,
    ...(prosTotalTime !== null && { prosRemainingTime: prosTotalTime }),
    ...(consTotalTime !== null && { consRemainingTime: consTotalTime }),
  };
}
