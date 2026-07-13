import {
  NonTimerEventType,
  SocketEventType,
  TimerEventTypes,
  SocketMessage,
} from './type';

const TIMER_EVENT_TYPES: TimerEventTypes[] = [
  'NEXT',
  'STOP',
  'BEFORE',
  'PLAY',
  'RESET',
  'TEAM_SWITCH',
];

const NON_TIMER_EVENT_TYPES: NonTimerEventType[] = ['FINISHED', 'ERROR'];

export function isTimerEventType(
  event: SocketEventType,
): event is TimerEventTypes {
  return TIMER_EVENT_TYPES.includes(event as TimerEventTypes);
}

export function isNonTimerEventType(
  event: SocketEventType,
): event is NonTimerEventType {
  return NON_TIMER_EVENT_TYPES.includes(event as NonTimerEventType);
}

export function isSocketMessage(value: unknown): value is SocketMessage {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;
  const eventType = obj.eventType as SocketEventType;

  if (isTimerEventType(eventType)) {
    const data = obj.data as Record<string, unknown>;
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    if (data.timerType !== 'NORMAL' && data.timerType !== 'TIME_BASED') {
      return false;
    }

    if (typeof data.sequence !== 'number' || !Number.isFinite(data.sequence)) {
      return false;
    }

    if (
      typeof data.remainingTime !== 'number' ||
      !Number.isFinite(data.remainingTime)
    ) {
      return false;
    }

    if (
      data.currentTeam !== undefined &&
      data.currentTeam !== null &&
      data.currentTeam !== 'PROS' &&
      data.currentTeam !== 'CONS'
    ) {
      return false;
    }

    if (data.timerType === 'TIME_BASED') {
      if (data.currentTeam !== 'PROS' && data.currentTeam !== 'CONS') {
        return false;
      }
    }

    return true;
  }

  if (isNonTimerEventType(eventType)) {
    return obj.data === null;
  }

  return false;
}
