import { Stance, TimeBoxType } from '../../type/type';

// WS 사용을 위한 이벤트 타입
export type TimerEventTypes =
  | 'NEXT'
  | 'STOP'
  | 'BEFORE'
  | 'PLAY'
  | 'RESET'
  | 'TEAM_SWITCH'
  | 'SYNC';

// 데이터가 없는 이벤트
export type NonTimerEventType = 'FINISHED' | 'ERROR';

// 데이터가 반드시 포함되는 이벤트
export type SocketEventType = TimerEventTypes | NonTimerEventType;

/** 소켓 통신에 사용되는, 타이머 이벤트 데이터 페이로드 */
export interface TimerDataPayload {
  /** 타이머 유형 (자유토론, 일반) */
  timerType: Exclude<TimeBoxType, 'FEEDBACK'>;

  /** 현재 타이머 순서
   * - 0부터 시작
   * - `NEXT`, `BEFORE` 이벤트의 경우, 발언해야 할 차례의 타이머 순서를 의미
   */
  sequence: number;

  /** 현재 발언하고 있는 팀의 진영 */
  currentTeam?: Stance;

  /** 남은 시간 (초 단위) */
  remainingTime: number;

  /** 타이머 재생 여부
   * - `SYNC` 이벤트에서는 필수
   */
  isRunning?: boolean;

  /** 찬성 팀의 총 남은 시간 (초 단위)
   * - 자유토론 `SYNC` 이벤트에서는 필수
   */
  prosRemainingTime?: number;

  /** 반대 팀의 총 남은 시간 (초 단위)
   * - 자유토론 `SYNC` 이벤트에서는 필수
   */
  consRemainingTime?: number;
}

// 공통 메시지 구조
// 데이터가 null인 이벤트와 그렇지 않은 이벤트를 명확히 구분
// version은 사회자가 발행 순서대로 증가시키는 값으로, 오래된 메시지를 걸러내는 데 사용
export type SocketMessage =
  | {
      eventType: TimerEventTypes;
      data: TimerDataPayload;
      version?: number;
    }
  | {
      eventType: NonTimerEventType;
      data: null;
      version?: number;
    };
