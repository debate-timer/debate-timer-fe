import { Stance, TimeBoxType } from '../../types/type';

// WS 사용을 위한 이벤트 타입
export type TimerEventTypes =
  'NEXT' | 'STOP' | 'BEFORE' | 'PLAY' | 'RESET' | 'TEAM_SWITCH' | 'SYNC';

// 데이터가 없는 이벤트
export type NonTimerEventType = 'FINISHED' | 'ERROR';

// 서버만 보내는 데이터가 없는 이벤트 (사회자는 발행할 수 없음)
// - `CHAIRMAN_ABSENT`: 룸에 활성 사회자가 없음을 청중에게 알림
export type ServerEventType = 'CHAIRMAN_ABSENT';

// 다기기 녹음 참가 정보를 담는 이벤트 (data는 null이고 참가 정보는 `recording`에 담음)
// - `RECORDING_OPENED`: 사회자가 연 녹음 세션의 참가 정보를 이미 공유 화면을 보고 있는 청중에게 알림
// - `RECORDING_CLOSED`: 사회자가 녹음을 끝내 해당 세션에 더는 참여할 수 없음을 알림
export type RecordingEventType = 'RECORDING_OPENED' | 'RECORDING_CLOSED';

// 데이터가 반드시 포함되는 이벤트
export type SocketEventType = TimerEventTypes | NonTimerEventType;

/** 다기기 녹음 참가 정보. 청중 기기가 이 값으로 녹음 세션에 참가함 */
export interface RecordingJoinPayload {
  sessionKey: string;
  joinCode: string;
}

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
  isRunning?: boolean | null;

  /** 찬성 팀의 총 남은 시간 (초 단위)
   * - 자유토론 `SYNC` 이벤트에서는 필수
   */
  prosRemainingTime?: number | null;

  /** 반대 팀의 총 남은 시간 (초 단위)
   * - 자유토론 `SYNC` 이벤트에서는 필수
   */
  consRemainingTime?: number | null;
}

// 공통 메시지 구조
// 데이터가 null인 이벤트와 그렇지 않은 이벤트를 명확히 구분
// version은 사회자가 발행 순서대로 증가시키는 값으로, 오래된 메시지를 걸러내는 데 사용
// serverTime은 서버가 메시지를 중계한 시각(epoch ms)으로, 청중이 수신까지 흐른 시간을 보정하는 데 사용 (서버만 채움)
export type SocketMessage =
  | {
      eventType: TimerEventTypes;
      data: TimerDataPayload;
      version?: number | null;
      serverTime?: number | null;
    }
  | {
      eventType: NonTimerEventType | ServerEventType;
      data: null;
      version?: number | null;
      serverTime?: number | null;
    }
  | {
      eventType: RecordingEventType;
      data: null;
      recording: RecordingJoinPayload;
      version?: number | null;
      serverTime?: number | null;
    };

/** 사회자 세션 식별자를 담는 STOMP 헤더 이름 */
export const CHAIRMAN_SESSION_HEADER = 'X-Chairman-Session';

/**
 * 서버가 사회자 채널(`/chairman/{roomId}`)로 보내는 알림 유형
 * - `SYNC_REQUEST`: 새 청중이 입장해 현재 상태 공유가 필요함
 * - `REPLACED`: 다른 사회자 세션이 활성 사회자가 됨 (`activeSessionId`가 자신이 아니면 발행 권한을 잃음)
 */
export type ChairmanNoticeType = 'SYNC_REQUEST' | 'REPLACED';

export interface ChairmanNotice {
  type: ChairmanNoticeType;
  roomId: number;
  activeSessionId?: string | null;
}
