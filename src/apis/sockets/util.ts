import { NonTimerEventType, SocketEventType, TimerEventTypes } from './type';

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
