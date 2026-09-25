import { useState, useEffect, useCallback } from 'react';
import useAudienceSocket from '../../../hooks/sockets/useAudienceSocket';
import { AudienceShareError, AudienceShareErrorCode } from '../error';
import { TimeBoxInfo } from '../../../type/type';
import { isSocketError } from '../../../apis/sockets/error';
import {
  getDisplayDataByEvent,
  createInitialDisplayData,
  AudienceDisplayData,
} from './EventInterpreter';
import { getNetworkDelayMs } from './getNetworkDelayMs';

/**
 * 서버 연결 상태
 * - `connected`: 연결되어 있거나 자동 재연결을 시도하는 중
 * - `lost`: 재연결 시도를 모두 소진해 스스로 복구할 수 없음 (새로고침이 필요)
 */
export type AudienceConnectionStatus = 'connected' | 'lost';

export type AudienceShareState =
  | { status: 'connecting'; error: AudienceShareError | null }
  | { status: 'waiting'; error: AudienceShareError | null }
  | {
      status: 'displaying';
      error: AudienceShareError | null;
      displayData: AudienceDisplayData;
      /**
       * 표시 중인 남은 시간이 유효했던 시각(기기 시계 기준, epoch ms)
       * - 수신 시각에서 서버 중계 이후 흐른 네트워크 지연을 뺀 값
       * - 메시지 없이 만든 초기 화면이면 `null`
       */
      syncedAt: number | null;
    }
  | { status: 'finished'; error: AudienceShareError | null };

/**
 * 사회자 연결 상태
 * - `waiting`: 연결 후 `CHAIRMAN_ABSENT_TIMEOUT_MS`가 지나기 전이며 사회자 메시지를 아직 받지 못함
 * - `present`: 최근 `CHAIRMAN_ABSENT_TIMEOUT_MS` 안에 사회자 메시지를 받음
 * - `absent`: 다음 중 하나
 *   - 서버가 활성 사회자가 없다고 알린 뒤 사회자 메시지를 받지 못함
 *   - 연결 후 `CHAIRMAN_ABSENT_TIMEOUT_MS` 동안 사회자 메시지를 한 번도 받지 못함
 *   - 마지막 사회자 메시지 이후 `CHAIRMAN_ABSENT_TIMEOUT_MS` 동안 수신이 없음
 */
export type ChairmanPresence = 'waiting' | 'present' | 'absent';

// 사회자 heartbeat(5초) 3회를 놓치면 사회자 연결이 끊긴 것으로 판단
export const CHAIRMAN_ABSENT_TIMEOUT_MS = 15 * 1000;

// 연결 후 이 시간 동안 메시지가 없으면 첫 순서 타이머를 정지 상태로 먼저 표시
const INITIAL_DISPLAY_DELAY_MS = 1000;

interface UseAudienceShareStateOptions {
  enabled?: boolean;
  table?: TimeBoxInfo[];
}

export function useAudienceShareState(
  roomId: number,
  options: UseAudienceShareStateOptions = {},
): AudienceShareState & {
  chairmanPresence: ChairmanPresence;
  connectionStatus: AudienceConnectionStatus;
} {
  const { enabled = true, table } = options;
  const {
    connect,
    disconnect,
    latestMessage,
    latestMessageReceivedAt,
    lastReceivedAt,
    chairmanAbsentAt,
    isConnected,
    error: socketError,
  } = useAudienceSocket(roomId, { enabled });

  // 재연결 시도를 모두 소진하면 자동으로 복구되지 않는다
  const isRetryExhausted =
    isSocketError(socketError) && socketError.code === 'SOCKET_RETRY_EXHAUSTED';

  const [error, setError] = useState<AudienceShareError | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const [displayData, setDisplayData] = useState<AudienceDisplayData | null>(
    null,
  );
  const [syncedAt, setSyncedAt] = useState<number | null>(null);

  // 보여주던 화면이 있는 상태에서 재연결이 소진되면, 화면을 지우는 대신 새로고침을 안내한다
  const isConnectionLost = isRetryExhausted && displayData !== null;

  const [isChairmanAbsent, setIsChairmanAbsent] = useState<boolean>(false);
  const [isFirstMessageTimedOut, setIsFirstMessageTimedOut] =
    useState<boolean>(false);

  const cleanup = useCallback(() => {
    disconnect();
  }, [disconnect]);

  // Mount/Unmount
  useEffect(() => {
    if (!enabled) {
      return;
    }

    connect();
    return () => {
      cleanup();
    };
  }, [connect, cleanup, enabled]);

  // Handle Socket Error
  // 재연결 소진은 이미 보여주던 화면이 있으면 오류로 넘기지 않고, 그 화면을 유지한 채 새로고침을 안내한다
  useEffect(() => {
    if (enabled && socketError && !isConnectionLost) {
      cleanup();
      let code: AudienceShareErrorCode = 'UNKNOWN';
      if (isSocketError(socketError)) {
        code = socketError.code;
      }
      setError(
        new AudienceShareError(
          code,
          socketError instanceof Error
            ? socketError
            : new Error(String(socketError)),
        ),
      );
    }
  }, [enabled, socketError, isConnectionLost, cleanup]);

  // Handle Messages and Disconnects
  useEffect(() => {
    if (!enabled || error || isFinished) return; // Ignore if inactive, already failed or finished

    // 연결이 끊긴 채로 남은 화면은 마지막 상태 그대로 둔다
    if (isConnectionLost) return;

    if (!isConnected || !latestMessage) {
      setDisplayData(null);
      setSyncedAt(null);
      return;
    }

    if (latestMessage.eventType === 'ERROR') {
      cleanup();
      setError(new AudienceShareError('SERVER_ERROR'));
      return;
    }

    if (latestMessage.eventType === 'FINISHED') {
      cleanup();
      setIsFinished(true);
      return;
    }

    const { eventType, data } = latestMessage;
    if (!data) return;

    setDisplayData((previousDisplayData) =>
      getDisplayDataByEvent(eventType, data, previousDisplayData, table),
    );
    setSyncedAt(
      latestMessageReceivedAt === null
        ? null
        : latestMessageReceivedAt -
            getNetworkDelayMs(
              latestMessage.serverTime,
              latestMessageReceivedAt,
            ),
    );
  }, [
    enabled,
    isConnected,
    isConnectionLost,
    latestMessage,
    latestMessageReceivedAt,
    error,
    isFinished,
    cleanup,
    table,
  ]);

  // 마지막 수신 후 일정 시간 동안 메시지가 없으면 사회자 연결이 끊긴 것으로 판단
  useEffect(() => {
    setIsChairmanAbsent(false);

    if (lastReceivedAt === null) {
      return;
    }

    const elapsed = Date.now() - lastReceivedAt;
    const absentTimeout = setTimeout(
      () => {
        setIsChairmanAbsent(true);
      },
      Math.max(CHAIRMAN_ABSENT_TIMEOUT_MS - elapsed, 0),
    );

    return () => {
      clearTimeout(absentTimeout);
    };
  }, [lastReceivedAt]);

  // 연결 후 일정 시간 동안 사회자 메시지를 한 번도 받지 못하면 사회자가 없는 것으로 판단
  // (서버의 상태 공유 요청에 사회자가 응답하지 않는 경우)
  useEffect(() => {
    setIsFirstMessageTimedOut(false);

    if (!enabled || !isConnected || lastReceivedAt !== null) {
      return;
    }

    const firstMessageTimeout = setTimeout(() => {
      setIsFirstMessageTimedOut(true);
    }, CHAIRMAN_ABSENT_TIMEOUT_MS);

    return () => {
      clearTimeout(firstMessageTimeout);
    };
  }, [enabled, isConnected, lastReceivedAt]);

  // 서버의 사회자 부재 알림 이후 사회자 메시지를 받지 못했다면 사회자가 없는 것으로 판단
  const isChairmanAbsentNotified =
    chairmanAbsentAt !== null &&
    (lastReceivedAt === null || chairmanAbsentAt >= lastReceivedAt);

  let chairmanPresence: ChairmanPresence = 'present';
  if (isChairmanAbsentNotified) {
    chairmanPresence = 'absent';
  } else if (lastReceivedAt === null) {
    chairmanPresence = isFirstMessageTimedOut ? 'absent' : 'waiting';
  } else if (isChairmanAbsent) {
    chairmanPresence = 'absent';
  }

  // 사회자 응답을 기다리는 동안 빈 화면 대신 첫 순서 타이머를 정지 상태로 표시
  // 이후 SYNC 등 메시지를 받으면 받은 상태로 바뀐다
  const isWaitingFirstMessage =
    enabled && isConnected && !error && !isFinished && displayData === null;
  useEffect(() => {
    if (!isWaitingFirstMessage) {
      return;
    }

    const initialDisplayTimeout = setTimeout(() => {
      setDisplayData(
        (previousDisplayData) =>
          previousDisplayData ?? createInitialDisplayData(table),
      );
    }, INITIAL_DISPLAY_DELAY_MS);

    return () => {
      clearTimeout(initialDisplayTimeout);
    };
  }, [isWaitingFirstMessage, table]);

  const connectionStatus: AudienceConnectionStatus = isConnectionLost
    ? 'lost'
    : 'connected';

  let status: AudienceShareState['status'] = 'connecting';
  if (!enabled) {
    status = 'connecting';
  } else if (isFinished) {
    status = 'finished';
  } else if (!isConnected && !isConnectionLost) {
    status = 'connecting';
  } else if (!displayData) {
    status = 'waiting';
  } else {
    status = 'displaying';
  }

  if (status === 'displaying') {
    return {
      status,
      error,
      displayData: displayData!,
      syncedAt,
      chairmanPresence,
      connectionStatus,
    };
  }

  return {
    status,
    error,
    chairmanPresence,
    connectionStatus,
  };
}
