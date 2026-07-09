import { useState, useEffect, useRef, useCallback } from 'react';
import useAudienceSocket from '../../../hooks/sockets/useAudienceSocket';
import { AudienceShareError, AudienceShareErrorCode } from '../error';
import { TimeBasedStance } from '../../../type/type';
import { isSocketError } from '../../../apis/sockets/error';

type AudienceNormalDisplayData = {
  timerType: 'NORMAL';
  currentTeam: null;
  isRunning: boolean;
  singleTime: number;
};

type AudienceTimeBasedDisplayData = {
  timerType: 'TIME_BASED';
  currentTeam: TimeBasedStance;
  isRunning: boolean;
  prosTime: number | null;
  consTime: number | null;
};

type AudienceDisplayData =
  | AudienceNormalDisplayData
  | AudienceTimeBasedDisplayData;

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

function getNextTeam(team: TimeBasedStance): TimeBasedStance {
  return team === 'PROS' ? 'CONS' : 'PROS';
}

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

    const isRunning = eventType === 'PLAY';

    setDisplayData((prev) => {
      if (data.timerType === 'NORMAL') {
        return {
          timerType: 'NORMAL',
          currentTeam: null,
          isRunning,
          singleTime: data.remainingTime,
        };
      }

      if (data.currentTeam !== 'PROS' && data.currentTeam !== 'CONS') {
        return prev;
      }

      const previousTimeBasedData =
        prev?.timerType === 'TIME_BASED' ? prev : null;
      const receivedCurrentTeam = data.currentTeam;
      const displayCurrentTeam =
        eventType === 'TEAM_SWITCH'
          ? getNextTeam(receivedCurrentTeam)
          : receivedCurrentTeam;

      return {
        timerType: 'TIME_BASED',
        currentTeam: displayCurrentTeam,
        isRunning,
        prosTime:
          receivedCurrentTeam === 'PROS'
            ? data.remainingTime
            : (previousTimeBasedData?.prosTime ?? null),
        consTime:
          receivedCurrentTeam === 'CONS'
            ? data.remainingTime
            : (previousTimeBasedData?.consTime ?? null),
      };
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
