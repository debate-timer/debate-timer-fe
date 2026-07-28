import { TimeBasedStance, TimeBoxInfo } from '../../../type/type';
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

export type AudienceDisplayData =
  | AudienceNormalDisplayData
  | AudienceTimeBasedDisplayData;

export function getNextTeam(team: TimeBasedStance): TimeBasedStance {
  return team === 'PROS' ? 'CONS' : 'PROS';
}

export function getNormalTotalTime(
  table: TimeBoxInfo[] | undefined,
  sequence: number,
  fallbackTime: number,
): number {
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

export function createDisplayData(
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

export function createNavigationDisplayData(
  eventType: 'BEFORE' | 'NEXT',
  data: TimerDataPayload,
  previousDisplayData: AudienceDisplayData | null,
  table: TimeBoxInfo[] | undefined,
  sequence: number,
): AudienceDisplayData | null {
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

export function getDisplayDataByEvent(
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
