import { useState, useEffect, useRef, useCallback } from 'react';
import useAudienceSocket from '../../../hooks/sockets/useAudienceSocket';
import { AudienceShareError, AudienceShareErrorCode } from '../error';
import { TimeBoxInfo } from '../../../type/type';
import { isSocketError } from '../../../apis/sockets/error';
import {
  getDisplayDataByEvent,
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

const EVENT_TIMEOUT_MS = 600 * 1000;

interface UseAudienceShareStateOptions {
  enabled?: boolean;
  table?: TimeBoxInfo[];
}

export function useAudienceShareState(
  roomId: number,
  options: UseAudienceShareStateOptions = {},
): AudienceShareState {
  const { enabled = true, table } = options;
  const {
    connect,
    disconnect,
    latestMessage,
    isConnected,
    error: socketError,
  } = useAudienceSocket(roomId, { enabled });

  const [error, setError] = useState<AudienceShareError | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const [displayData, setDisplayData] = useState<AudienceDisplayData | null>(
    null,
  );

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
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

    if (!isConnected) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setDisplayData(null);
      return;
    }

    const resetEventTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        cleanup();
        setError(new AudienceShareError('EVENT_TIMEOUT'));
      }, EVENT_TIMEOUT_MS);
    };

    if (!latestMessage) {
      resetEventTimeout();
      setDisplayData(null);
      return;
    }

    resetEventTimeout();

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
    };
  }

  return {
    status,
    error,
  };
}
