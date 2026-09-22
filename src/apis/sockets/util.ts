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
  'SYNC',
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

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

// 서버는 값이 없는 선택 필드를 null로 채워 보내므로 undefined와 null 모두 허용
function isOptional<T>(
  value: unknown,
  guard: (value: unknown) => value is T,
): boolean {
  return value === undefined || value === null || guard(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isSocketMessage(value: unknown): value is SocketMessage {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;
  const eventType = obj.eventType as SocketEventType;

  if (
    !isOptional(obj.version, isFiniteNumber) ||
    !isOptional(obj.serverTime, isFiniteNumber)
  ) {
    return false;
  }

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

    if (
      !isOptional(data.isRunning, isBoolean) ||
      !isOptional(data.prosRemainingTime, isFiniteNumber) ||
      !isOptional(data.consRemainingTime, isFiniteNumber)
    ) {
      return false;
    }

    if (eventType === 'SYNC') {
      if (!isBoolean(data.isRunning)) {
        return false;
      }

      if (
        data.timerType === 'TIME_BASED' &&
        (!isFiniteNumber(data.prosRemainingTime) ||
          !isFiniteNumber(data.consRemainingTime))
      ) {
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
