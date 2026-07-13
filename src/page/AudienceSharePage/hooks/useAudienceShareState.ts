import { useState, useEffect, useRef, useCallback } from 'react';
import useAudienceSocket from '../../../hooks/sockets/useAudienceSocket';
import { AudienceShareError, AudienceShareErrorCode } from '../error';
import { TimeBasedStance, TimeBoxInfo } from '../../../type/type';
import { isSocketError } from '../../../apis/sockets/error';
import { TimerDataPayload, TimerEventTypes } from '../../../apis/sockets/type';

export type AudienceNormalDisplayData = {
  timerType: 'NORMAL';
  currentTeam: null;
  isRunning: boolean;
  singleTime: number;
  sequence: number;
};

export type AudienceTimeBasedDisplayData = {
  timerType: 'TIME_BASED';
  currentTeam: TimeBasedStance;
  isRunning: boolean;
  prosTime: number | null;
  consTime: number | null;
  sequence: number;
  eventType: TimerEventTypes;
  revision: number;
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

interface UseAudienceShareStateOptions {
  enabled?: boolean;
  table?: TimeBoxInfo[];
}

function getNextTeam(team: TimeBasedStance): TimeBasedStance {
  return team === 'PROS' ? 'CONS' : 'PROS';
}

function getNormalTotalTime(
  table: TimeBoxInfo[] | undefined,
  sequence: number,
  fallbackTime: number,
) {
  const timeBox = table?.[sequence];

  if (
    timeBox?.boxType === 'NORMAL' &&
    timeBox.time !== null &&
    timeBox.time > 0
  ) {
    return timeBox.time;
  }

  return fallbackTime;
}

function createDisplayData(
  data: TimerDataPayload,
  previousDisplayData: AudienceDisplayData | null,
  options: {
    eventType: TimerEventTypes;
    isRunning: boolean;
    sequence?: number;
    normalTime?: number;
    shouldSwitchTeam?: boolean;
  },
): AudienceDisplayData | null {
  const {
    eventType,
    isRunning,
    sequence = data.sequence,
    normalTime = data.remainingTime,
    shouldSwitchTeam = false,
  } = options;

  if (data.timerType === 'NORMAL') {
    return {
      timerType: 'NORMAL',
      currentTeam: null,
      isRunning,
      singleTime: normalTime,
      sequence,
    };
  }

  if (data.currentTeam !== 'PROS' && data.currentTeam !== 'CONS') {
    return previousDisplayData;
  }

  const previousTimeBasedData =
    previousDisplayData?.timerType === 'TIME_BASED'
      ? previousDisplayData
      : null;
  const receivedCurrentTeam = data.currentTeam;

  return {
    timerType: 'TIME_BASED',
    currentTeam: shouldSwitchTeam
      ? getNextTeam(receivedCurrentTeam)
      : receivedCurrentTeam,
    isRunning,
    prosTime:
      receivedCurrentTeam === 'PROS'
        ? data.remainingTime
        : (previousTimeBasedData?.prosTime ?? null),
    consTime:
      receivedCurrentTeam === 'CONS'
        ? data.remainingTime
        : (previousTimeBasedData?.consTime ?? null),
    sequence,
    eventType,
    revision: (previousTimeBasedData?.revision ?? 0) + 1,
  };
}

function createNavigationDisplayData(
  eventType: 'BEFORE' | 'NEXT',
  data: TimerDataPayload,
  previousDisplayData: AudienceDisplayData | null,
  table: TimeBoxInfo[] | undefined,
  sequence: number,
) {
  const targetTimeBox = table?.[sequence];

  if (
    targetTimeBox?.boxType === 'NORMAL' &&
    targetTimeBox.time !== null &&
    targetTimeBox.time > 0
  ) {
    return {
      timerType: 'NORMAL' as const,
      currentTeam: null,
      isRunning: false,
      singleTime: targetTimeBox.time,
      sequence,
    };
  }

  if (
    targetTimeBox?.boxType === 'TIME_BASED' &&
    targetTimeBox.timePerTeam !== null &&
    targetTimeBox.timePerTeam > 0
  ) {
    const previousTimeBasedData =
      previousDisplayData?.timerType === 'TIME_BASED'
        ? previousDisplayData
        : null;
    const currentTeam =
      data.currentTeam === 'PROS' || data.currentTeam === 'CONS'
        ? data.currentTeam
        : (previousTimeBasedData?.currentTeam ?? 'PROS');
    const initialCurrentTime =
      targetTimeBox.timePerSpeaking ?? targetTimeBox.timePerTeam;

    return {
      timerType: 'TIME_BASED' as const,
      currentTeam,
      isRunning: false,
      prosTime: currentTeam === 'PROS' ? initialCurrentTime : null,
      consTime: currentTeam === 'CONS' ? initialCurrentTime : null,
      sequence,
      eventType,
      revision: (previousTimeBasedData?.revision ?? 0) + 1,
    };
  }

  return null;
}

function getDisplayDataByEvent(
  eventType: TimerEventTypes,
  data: TimerDataPayload,
  previousDisplayData: AudienceDisplayData | null,
  table: TimeBoxInfo[] | undefined,
): AudienceDisplayData | null {
  switch (eventType) {
    case 'PLAY':
      return createDisplayData(data, previousDisplayData, {
        eventType,
        isRunning: true,
      });

    case 'STOP':
      return createDisplayData(data, previousDisplayData, {
        eventType,
        isRunning: false,
      });

    case 'RESET':
      return createDisplayData(data, previousDisplayData, {
        eventType,
        isRunning: false,
        normalTime: getNormalTotalTime(
          table,
          data.sequence,
          data.remainingTime,
        ),
      });

    case 'BEFORE': {
      const previousSequence = data.sequence - 1;
      const navigationDisplayData = createNavigationDisplayData(
        eventType,
        data,
        previousDisplayData,
        table,
        previousSequence,
      );

      if (navigationDisplayData) {
        return navigationDisplayData;
      }

      return createDisplayData(data, previousDisplayData, {
        eventType,
        isRunning: false,
        sequence: previousSequence,
        normalTime: getNormalTotalTime(
          table,
          previousSequence,
          data.remainingTime,
        ),
      });
    }

    case 'NEXT': {
      const nextSequence = data.sequence + 1;
      const navigationDisplayData = createNavigationDisplayData(
        eventType,
        data,
        previousDisplayData,
        table,
        nextSequence,
      );

      if (navigationDisplayData) {
        return navigationDisplayData;
      }

      return createDisplayData(data, previousDisplayData, {
        eventType,
        isRunning: false,
        sequence: nextSequence,
        normalTime: getNormalTotalTime(table, nextSequence, data.remainingTime),
      });
    }

    case 'TEAM_SWITCH':
      return createDisplayData(data, previousDisplayData, {
        eventType,
        isRunning:
          previousDisplayData?.timerType === 'TIME_BASED'
            ? previousDisplayData.isRunning
            : false,
        shouldSwitchTeam: true,
      });
  }
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
