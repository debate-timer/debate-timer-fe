import { useEffect, useRef, useState } from 'react';
import { TimeBasedStance } from '../../../type/type';
import { useAudienceCountdown } from './useAudienceCountdown';
import { AudienceTimeBasedDisplayData } from './EventInterpreter';

interface TeamCountdownInput {
  totalTime: number | null;
  speakingTime: number | null;
  totalSyncKey: number;
  speakingSyncKey: number;
}

interface CountdownInputs {
  sequence: number | null;
  timePerTeam: number | null;
  timePerSpeaking: number | null;
  pros: TeamCountdownInput;
  cons: TeamCountdownInput;
}

interface TeamCountdownResult {
  totalRemainingTime: number | null;
  currentSpeakingRemainingTime: number | null;
  isRunning: boolean;
}

export interface UseAudienceTimeBasedCountdownParams {
  displayData: AudienceTimeBasedDisplayData | null;
  timePerTeam: number | null;
  timePerSpeaking: number | null;
}

export interface UseAudienceTimeBasedCountdownReturn {
  pros: TeamCountdownResult;
  cons: TeamCountdownResult;
}

interface GetNextSpeakingTimeParams {
  totalRemainingTime: number;
  timePerSpeaking: number | null;
  isOpponentTotalDone: boolean;
}

const EMPTY_TEAM_INPUT: TeamCountdownInput = {
  totalTime: null,
  speakingTime: null,
  totalSyncKey: 0,
  speakingSyncKey: 0,
};

function createInitialInputs(): CountdownInputs {
  return {
    sequence: null,
    timePerTeam: null,
    timePerSpeaking: null,
    pros: EMPTY_TEAM_INPUT,
    cons: EMPTY_TEAM_INPUT,
  };
}

function createTeamInput(
  totalTime: number,
  speakingTime: number | null,
  previousInput: TeamCountdownInput,
): TeamCountdownInput {
  return {
    totalTime,
    speakingTime,
    totalSyncKey: previousInput.totalSyncKey + 1,
    speakingSyncKey: previousInput.speakingSyncKey + 1,
  };
}

function getTeamValue<T>(team: TimeBasedStance, prosValue: T, consValue: T) {
  return team === 'PROS' ? prosValue : consValue;
}

function updateTeamInput(
  inputs: CountdownInputs,
  team: TimeBasedStance,
  update: (input: TeamCountdownInput) => TeamCountdownInput,
) {
  if (team === 'PROS') {
    return { ...inputs, pros: update(inputs.pros) };
  }

  return { ...inputs, cons: update(inputs.cons) };
}

export function getNextSpeakingTime({
  totalRemainingTime,
  timePerSpeaking,
  isOpponentTotalDone,
}: GetNextSpeakingTimeParams) {
  if (timePerSpeaking === null) {
    return null;
  }

  if (isOpponentTotalDone) {
    return totalRemainingTime;
  }

  return Math.min(totalRemainingTime, timePerSpeaking);
}

export function useAudienceTimeBasedCountdown({
  displayData,
  timePerTeam,
  timePerSpeaking,
}: UseAudienceTimeBasedCountdownParams): UseAudienceTimeBasedCountdownReturn {
  const [inputs, setInputs] = useState<CountdownInputs>(createInitialInputs);
  const [isProsLocallyStopped, setIsProsLocallyStopped] = useState(false);
  const [isConsLocallyStopped, setIsConsLocallyStopped] = useState(false);
  const configurationKeyRef = useRef('');
  const latestValuesRef = useRef({
    prosTotal: null as number | null,
    prosSpeaking: null as number | null,
    consTotal: null as number | null,
    consSpeaking: null as number | null,
  });

  const isProsRequestedToRun =
    displayData?.isRunning === true &&
    displayData.currentTeam === 'PROS' &&
    !isProsLocallyStopped;
  const isConsRequestedToRun =
    displayData?.isRunning === true &&
    displayData.currentTeam === 'CONS' &&
    !isConsLocallyStopped;

  const prosTotalCountdown = useAudienceCountdown({
    receivedTime: inputs.pros.totalTime,
    isRunning: isProsRequestedToRun,
    minimumTime: 0,
    shouldResetOnRunStateChange: false,
    syncKey: inputs.pros.totalSyncKey,
  });
  const prosSpeakingCountdown = useAudienceCountdown({
    receivedTime: inputs.pros.speakingTime,
    isRunning: isProsRequestedToRun,
    minimumTime: 0,
    shouldResetOnRunStateChange: false,
    syncKey: inputs.pros.speakingSyncKey,
  });
  const consTotalCountdown = useAudienceCountdown({
    receivedTime: inputs.cons.totalTime,
    isRunning: isConsRequestedToRun,
    minimumTime: 0,
    shouldResetOnRunStateChange: false,
    syncKey: inputs.cons.totalSyncKey,
  });
  const consSpeakingCountdown = useAudienceCountdown({
    receivedTime: inputs.cons.speakingTime,
    isRunning: isConsRequestedToRun,
    minimumTime: 0,
    shouldResetOnRunStateChange: false,
    syncKey: inputs.cons.speakingSyncKey,
  });

  const prosTotal = prosTotalCountdown.currentSeconds;
  const prosSpeaking = prosSpeakingCountdown.currentSeconds;
  const consTotal = consTotalCountdown.currentSeconds;
  const consSpeaking = consSpeakingCountdown.currentSeconds;
  const displaySequence = displayData?.sequence ?? null;
  const displayRevision = displayData?.revision ?? 0;
  const displayEventType = displayData?.eventType ?? null;
  const displayCurrentTeam = displayData?.currentTeam ?? null;
  const displayProsTime = displayData?.prosTime ?? null;
  const displayConsTime = displayData?.consTime ?? null;

  latestValuesRef.current = {
    prosTotal,
    prosSpeaking,
    consTotal,
    consSpeaking,
  };

  useEffect(() => {
    if (prosTotal === 0 || prosSpeaking === 0) {
      setIsProsLocallyStopped(true);
    }
  }, [prosSpeaking, prosTotal]);

  useEffect(() => {
    if (consTotal === 0 || consSpeaking === 0) {
      setIsConsLocallyStopped(true);
    }
  }, [consSpeaking, consTotal]);

  useEffect(() => {
    if (
      displaySequence === null ||
      displayEventType === null ||
      displayCurrentTeam === null ||
      timePerTeam === null ||
      timePerTeam <= 0 ||
      (timePerSpeaking !== null && timePerSpeaking <= 0)
    ) {
      configurationKeyRef.current = '';
      setInputs(createInitialInputs());
      setIsProsLocallyStopped(false);
      setIsConsLocallyStopped(false);
      return;
    }

    const configurationKey = `${displaySequence}:${timePerTeam}:${timePerSpeaking}`;
    const hasConfigurationChanged =
      configurationKeyRef.current !== configurationKey;
    configurationKeyRef.current = configurationKey;

    if (hasConfigurationChanged) {
      setIsProsLocallyStopped(false);
      setIsConsLocallyStopped(false);
    } else if (
      displayEventType === 'PLAY' ||
      displayEventType === 'RESET' ||
      displayEventType === 'TEAM_SWITCH'
    ) {
      if (displayCurrentTeam === 'PROS') {
        setIsProsLocallyStopped(false);
      } else {
        setIsConsLocallyStopped(false);
      }
    }

    setInputs((previousInputs) => {
      const defaultSpeakingTime = timePerSpeaking;
      let nextInputs = hasConfigurationChanged
        ? {
            sequence: displaySequence,
            timePerTeam,
            timePerSpeaking,
            pros: createTeamInput(
              timePerTeam,
              defaultSpeakingTime,
              previousInputs.pros,
            ),
            cons: createTeamInput(
              timePerTeam,
              defaultSpeakingTime,
              previousInputs.cons,
            ),
          }
        : previousInputs;

      const currentTeam = displayCurrentTeam;
      const opponentTeam = currentTeam === 'PROS' ? 'CONS' : 'PROS';
      const latestCurrentTotal = getTeamValue(
        currentTeam,
        latestValuesRef.current.prosTotal,
        latestValuesRef.current.consTotal,
      );
      const currentInput = getTeamValue(
        currentTeam,
        nextInputs.pros,
        nextInputs.cons,
      );
      const currentTotal = latestCurrentTotal ?? currentInput.totalTime ?? 0;
      const receivedCurrentTime = getTeamValue(
        currentTeam,
        displayProsTime,
        displayConsTime,
      );

      if (displayEventType === 'BEFORE' || displayEventType === 'NEXT') {
        return nextInputs;
      }

      if (displayEventType === 'RESET') {
        const opponentTotal = getTeamValue(
          opponentTeam,
          latestValuesRef.current.prosTotal,
          latestValuesRef.current.consTotal,
        );
        const resetSpeakingTime = getNextSpeakingTime({
          totalRemainingTime: timePerTeam,
          timePerSpeaking,
          isOpponentTotalDone: opponentTotal === 0,
        });

        return updateTeamInput(nextInputs, currentTeam, (input) =>
          createTeamInput(timePerTeam, resetSpeakingTime, input),
        );
      }

      if (displayEventType === 'TEAM_SWITCH') {
        const previousTeam = opponentTeam;
        const receivedPreviousTime = getTeamValue(
          previousTeam,
          displayProsTime,
          displayConsTime,
        );
        const previousTeamTotal = getTeamValue(
          previousTeam,
          latestValuesRef.current.prosTotal,
          latestValuesRef.current.consTotal,
        );
        const newSpeakingTime = getNextSpeakingTime({
          totalRemainingTime: currentTotal,
          timePerSpeaking,
          isOpponentTotalDone:
            (timePerSpeaking === null
              ? receivedPreviousTime
              : previousTeamTotal) === 0,
        });

        nextInputs = updateTeamInput(nextInputs, previousTeam, (input) => ({
          ...input,
          ...(timePerSpeaking === null
            ? { totalTime: receivedPreviousTime ?? input.totalTime }
            : { speakingTime: receivedPreviousTime ?? input.speakingTime }),
          totalSyncKey:
            timePerSpeaking === null
              ? input.totalSyncKey + 1
              : input.totalSyncKey,
          speakingSyncKey:
            timePerSpeaking === null
              ? input.speakingSyncKey
              : input.speakingSyncKey + 1,
        }));
        nextInputs = updateTeamInput(nextInputs, currentTeam, (input) => ({
          ...input,
          speakingTime: newSpeakingTime,
          speakingSyncKey: input.speakingSyncKey + 1,
        }));

        return nextInputs;
      }

      return updateTeamInput(nextInputs, currentTeam, (input) => ({
        ...input,
        ...(timePerSpeaking === null
          ? { totalTime: receivedCurrentTime ?? input.totalTime }
          : { speakingTime: receivedCurrentTime ?? input.speakingTime }),
        totalSyncKey:
          timePerSpeaking === null
            ? input.totalSyncKey + 1
            : input.totalSyncKey,
        speakingSyncKey:
          timePerSpeaking === null
            ? input.speakingSyncKey
            : input.speakingSyncKey + 1,
      }));
    });
  }, [
    displayConsTime,
    displayCurrentTeam,
    displayEventType,
    displayProsTime,
    displayRevision,
    displaySequence,
    timePerSpeaking,
    timePerTeam,
  ]);

  const isProsRunning =
    isProsRequestedToRun &&
    prosTotal !== null &&
    prosTotal > 0 &&
    (prosSpeaking === null || prosSpeaking > 0);
  const isConsRunning =
    isConsRequestedToRun &&
    consTotal !== null &&
    consTotal > 0 &&
    (consSpeaking === null || consSpeaking > 0);

  return {
    pros: {
      totalRemainingTime: prosTotal,
      currentSpeakingRemainingTime: prosSpeaking,
      isRunning: isProsRunning,
    },
    cons: {
      totalRemainingTime: consTotal,
      currentSpeakingRemainingTime: consSpeaking,
      isRunning: isConsRunning,
    },
  };
}
