import { useState, useEffect, useRef, useCallback } from 'react';
import useAudienceSocket from '../../../hooks/sockets/useAudienceSocket';
import { AudienceShareError, AudienceShareErrorCode } from '../error';
import { TimeBasedStance, TimeBoxType } from '../../../type/type';
import { isSocketError } from '../../../apis/sockets/error';

export type AudienceShareState =
  | { status: 'connecting'; error: AudienceShareError | null }
  | { status: 'waiting'; error: AudienceShareError | null }
  | {
      status: 'displaying';
      error: AudienceShareError | null;
      displayData: {
        timerType: Exclude<TimeBoxType, 'FEEDBACK'>;
        currentTeam: TimeBasedStance | null;
        isRunning: boolean;
        singleTime: number | null;
        prosTime: number | null;
        consTime: number | null;
      };
    }
  | { status: 'finished'; error: AudienceShareError | null };

const EVENT_TIMEOUT_MS = 600 * 1000;

export function useAudienceShareState(roomId: number): AudienceShareState {
  const {
    connect,
    disconnect,
    latestMessage,
    isConnected,
    error: socketError,
  } = useAudienceSocket(roomId);

  const [error, setError] = useState<AudienceShareError | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const [displayData, setDisplayData] = useState<{
    timerType: Exclude<TimeBoxType, 'FEEDBACK'>;
    currentTeam: TimeBasedStance | null;
    isRunning: boolean;
    singleTime: number | null;
    prosTime: number | null;
    consTime: number | null;
  } | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    disconnect();
  }, [disconnect]);

  // Mount/Unmount
  useEffect(() => {
    connect();
    return () => {
      cleanup();
    };
  }, [connect, cleanup]);

  // Handle Socket Error
  useEffect(() => {
    if (socketError) {
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
  }, [socketError, cleanup]);

  // Handle Messages and Disconnects
  useEffect(() => {
    if (error || isFinished) return; // Ignore if already failed or finished

    if (!isConnected) {
      setDisplayData(null);
      return;
    }

    if (!latestMessage) {
      setDisplayData(null);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      cleanup();
      setError(new AudienceShareError('EVENT_TIMEOUT'));
    }, EVENT_TIMEOUT_MS);

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

    const isRunning = eventType === 'PLAY';

    setDisplayData((prev) => {
      const newState = prev
        ? { ...prev }
        : {
            timerType: data.timerType,
            currentTeam: null,
            isRunning: false,
            singleTime: null,
            prosTime: null,
            consTime: null,
          };

      newState.timerType = data.timerType;
      newState.isRunning = isRunning;

      if (data.currentTeam === 'PROS' || data.currentTeam === 'CONS') {
        newState.currentTeam = data.currentTeam;
      }

      if (data.timerType === 'NORMAL') {
        newState.singleTime = data.remainingTime;
      } else if (data.timerType === 'TIME_BASED') {
        if (data.currentTeam === 'PROS') {
          newState.prosTime = data.remainingTime;
        } else if (data.currentTeam === 'CONS') {
          newState.consTime = data.remainingTime;
        }
      }

      return newState;
    });
  }, [isConnected, latestMessage, error, isFinished, cleanup]);

  let status: AudienceShareState['status'] = 'connecting';
  if (isFinished) {
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
