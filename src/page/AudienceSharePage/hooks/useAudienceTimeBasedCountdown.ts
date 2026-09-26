import { useEffect, useRef, useState } from 'react';
import { TimeBasedStance } from '../../../type/type';
import { useAudienceCountdown } from './useAudienceCountdown';
import { AudienceTimeBasedDisplayData } from './EventInterpreter';

interface TeamCountdownInput {
  totalTime: number | null;
  speakingTime: number | null;
  totalSyncKey: number;
  speakingSyncKey: number;
  /**
   * 1회당 발언 시간 모드에서 `전체 시간 - 발언 시간` (정수 초)
   * - 사회자는 두 시간을 같이 시작·정지하므로 실행 중 차이가 일정하다.
   * - 전체 시간을 발언 카운트다운에서 파생해 두 값이 같은 틱에 바뀌게 한다.
   */
  totalOffset: number | null;
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
  /** 표시 중인 시간이 유효했던 시각 (네트워크 지연 보정 기준, `useAudienceCountdown` 참고) */
  syncedAt?: number | null;
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
  totalOffset: null,
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
    totalOffset: speakingTime === null ? null : totalTime - speakingTime,
  };
}

/**
 * 발언 시간만 받았을 때의 오프셋
 * - 설정이 막 바뀌어 전체 시간이 아직 흐르지 않았다면 받은 발언 시간 기준으로 다시 계산
 * - 그 외에는 두 시간이 함께 흘렀으므로 기존 오프셋 유지
 */
function getSpeakingOnlyTotalOffset(
  input: TeamCountdownInput,
  receivedSpeakingTime: number | null,
  hasConfigurationChanged: boolean,
) {
  if (
    !hasConfigurationChanged ||
    receivedSpeakingTime === null ||
    input.totalTime === null
  ) {
    return input.totalOffset;
  }

  return input.totalTime - receivedSpeakingTime;
}

function getDerivedTotalTime(
  countdownTotal: number | null,
  speaking: number | null,
  totalOffset: number | null,
) {
  if (speaking === null || totalOffset === null) {
    return countdownTotal;
  }

  return Math.max(0, speaking + totalOffset);
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
  syncedAt,
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

  // 1회당 발언 시간 모드에서는 전체 시간을 발언 카운트다운에서 파생하므로 돌리지 않음
  const prosTotalCountdown = useAudienceCountdown({
    receivedTime: inputs.pros.totalTime,
    isRunning: isProsRequestedToRun && timePerSpeaking === null,
    minimumTime: 0,
    shouldResetOnRunStateChange: false,
    syncKey: inputs.pros.totalSyncKey,
    syncedAt,
  });
  const prosSpeakingCountdown = useAudienceCountdown({
    receivedTime: inputs.pros.speakingTime,
    isRunning: isProsRequestedToRun,
    minimumTime: 0,
    shouldResetOnRunStateChange: false,
    syncKey: inputs.pros.speakingSyncKey,
    syncedAt,
  });
  // 1회당 발언 시간 모드에서는 전체 시간을 발언 카운트다운에서 파생하므로 돌리지 않음
  const consTotalCountdown = useAudienceCountdown({
    receivedTime: inputs.cons.totalTime,
    isRunning: isConsRequestedToRun && timePerSpeaking === null,
    minimumTime: 0,
    shouldResetOnRunStateChange: false,
    syncKey: inputs.cons.totalSyncKey,
    syncedAt,
  });
  const consSpeakingCountdown = useAudienceCountdown({
    receivedTime: inputs.cons.speakingTime,
    isRunning: isConsRequestedToRun,
    minimumTime: 0,
    shouldResetOnRunStateChange: false,
    syncKey: inputs.cons.speakingSyncKey,
    syncedAt,
  });

  const prosSpeaking = prosSpeakingCountdown.currentSeconds;
  const consSpeaking = consSpeakingCountdown.currentSeconds;
  const prosTotal = getDerivedTotalTime(
    prosTotalCountdown.currentSeconds,
    prosSpeaking,
    inputs.pros.totalOffset,
  );
  const consTotal = getDerivedTotalTime(
    consTotalCountdown.currentSeconds,
    consSpeaking,
    inputs.cons.totalOffset,
  );
  const displaySequence = displayData?.sequence ?? null;
  const displayRevision = displayData?.revision ?? 0;
  const displayEventType = displayData?.eventType ?? null;
  const displayCurrentTeam = displayData?.currentTeam ?? null;
  const displayProsTime = displayData?.prosTime ?? null;
  const displayConsTime = displayData?.consTime ?? null;
  const displayProsTotalTime = displayData?.teamTotalTimes?.pros ?? null;
  const displayConsTotalTime = displayData?.teamTotalTimes?.cons ?? null;

  latestValuesRef.current = {
    prosTotal,
    prosSpeaking,
    consTotal,
    consSpeaking,
  };

  // 0초 도달 시 로컬 정지는 표시용이며, 종료 확정은 사회자 이벤트(STOP/SYNC)로 한다
  // (docs/live-share-timer-sync.md 참고)
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

    if (hasConfigurationChanged || displayEventType === 'SYNC') {
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

      // 설정이 막 바뀌었다면 표시 중인 값은 이전 순서의 것이므로 새 설정값을 사용
      const getLatestTotal = (team: TimeBasedStance) =>
        hasConfigurationChanged
          ? timePerTeam
          : getTeamValue(
              team,
              latestValuesRef.current.prosTotal,
              latestValuesRef.current.consTotal,
            );
      const currentTeam = displayCurrentTeam;
      const opponentTeam = currentTeam === 'PROS' ? 'CONS' : 'PROS';
      const latestCurrentTotal = getLatestTotal(currentTeam);
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

      // 현재 상태 스냅샷: 양 팀 총 시간과 현재 팀 발언 시간을 받은 값으로 덮어씀
      if (
        displayEventType === 'SYNC' &&
        displayProsTotalTime !== null &&
        displayConsTotalTime !== null
      ) {
        const syncedTotal = getTeamValue(
          currentTeam,
          displayProsTotalTime,
          displayConsTotalTime,
        );
        const syncedOpponentTotal = getTeamValue(
          opponentTeam,
          displayProsTotalTime,
          displayConsTotalTime,
        );
        const currentSpeakingTime =
          timePerSpeaking === null
            ? null
            : (receivedCurrentTime ??
              getNextSpeakingTime({
                totalRemainingTime: syncedTotal,
                timePerSpeaking,
                isOpponentTotalDone: syncedOpponentTotal === 0,
              }));
        const opponentSpeakingTime = getNextSpeakingTime({
          totalRemainingTime: syncedOpponentTotal,
          timePerSpeaking,
          isOpponentTotalDone: syncedTotal === 0,
        });

        nextInputs = updateTeamInput(nextInputs, currentTeam, (input) =>
          createTeamInput(syncedTotal, currentSpeakingTime, input),
        );
        return updateTeamInput(nextInputs, opponentTeam, (input) =>
          createTeamInput(syncedOpponentTotal, opponentSpeakingTime, input),
        );
      }

      if (displayEventType === 'RESET') {
        const opponentTotal = getLatestTotal(opponentTeam);
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
        const previousTeamTotal = getLatestTotal(previousTeam);
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
            : {
                speakingTime: receivedPreviousTime ?? input.speakingTime,
                totalOffset: getSpeakingOnlyTotalOffset(
                  input,
                  receivedPreviousTime,
                  hasConfigurationChanged,
                ),
              }),
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
          totalOffset:
            newSpeakingTime === null ? null : currentTotal - newSpeakingTime,
        }));

        return nextInputs;
      }

      return updateTeamInput(nextInputs, currentTeam, (input) => ({
        ...input,
        ...(timePerSpeaking === null
          ? { totalTime: receivedCurrentTime ?? input.totalTime }
          : {
              speakingTime: receivedCurrentTime ?? input.speakingTime,
              totalOffset: getSpeakingOnlyTotalOffset(
                input,
                receivedCurrentTime,
                hasConfigurationChanged,
              ),
            }),
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
    displayConsTotalTime,
    displayCurrentTeam,
    displayEventType,
    displayProsTime,
    displayProsTotalTime,
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
