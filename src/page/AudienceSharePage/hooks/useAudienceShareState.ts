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

export type AudienceShareState =
  | { status: 'connecting'; error: AudienceShareError | null }
  | { status: 'waiting'; error: AudienceShareError | null }
  | {
      status: 'displaying';
      error: AudienceShareError | null;
      displayData: AudienceDisplayData;
    }
  | { status: 'finished'; error: AudienceShareError | null };

/**
 * 사회자 연결 상태
 * - `waiting`: 연결 후 사회자 메시지를 아직 한 번도 받지 못함
 * - `present`: 최근 `CHAIRMAN_ABSENT_TIMEOUT_MS` 안에 사회자 메시지를 받음
 * - `absent`: 사회자 메시지를 받은 적은 있으나 `CHAIRMAN_ABSENT_TIMEOUT_MS` 동안 수신이 없음
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
): AudienceShareState & { chairmanPresence: ChairmanPresence } {
  const { enabled = true, table } = options;
  const {
    connect,
    disconnect,
    latestMessage,
    lastReceivedAt,
    isConnected,
    error: socketError,
  } = useAudienceSocket(roomId, { enabled });

  const [error, setError] = useState<AudienceShareError | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const [displayData, setDisplayData] = useState<AudienceDisplayData | null>(
    null,
  );

  const [isChairmanAbsent, setIsChairmanAbsent] = useState<boolean>(false);

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
  useEffect(() => {
    if (enabled && socketError) {
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
  }, [enabled, socketError, cleanup]);

  // Handle Messages and Disconnects
  useEffect(() => {
    if (!enabled || error || isFinished) return; // Ignore if inactive, already failed or finished

    if (!isConnected || !latestMessage) {
      setDisplayData(null);
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
  }, [enabled, isConnected, latestMessage, error, isFinished, cleanup, table]);

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

  let chairmanPresence: ChairmanPresence = 'present';
  if (lastReceivedAt === null) {
    chairmanPresence = 'waiting';
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

  let status: AudienceShareState['status'] = 'connecting';
  if (!enabled) {
    status = 'connecting';
  } else if (isFinished) {
    status = 'finished';
  } else if (!isConnected) {
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
      chairmanPresence,
    };
  }

  return {
    status,
    error,
    chairmanPresence,
  };
}
