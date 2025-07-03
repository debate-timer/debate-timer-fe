import { useEffect, useRef, useState } from 'react';
import { UseCustomTimerReturnType } from './useCustomTimer';
import { UseNormalTimerReturnType } from './useNormalTimer';

interface UseBellSoundProps {
  timer1: UseCustomTimerReturnType;
  timer2: UseCustomTimerReturnType;
  normalTimer: UseNormalTimerReturnType;
}

export function useBellSound({
  timer1,
  timer2,
  normalTimer,
}: UseBellSoundProps) {
  const warningBellRef = useRef<HTMLAudioElement>(null);
  const finishBellRef = useRef<HTMLAudioElement>(null);

  const prevTimer1Ref = useRef<{
    speakingTimer: number | null;
    totalTimer: number | null;
  }>({
    speakingTimer: null,
    totalTimer: null,
  });
  const prevTimer2Ref = useRef<{
    speakingTimer: number | null;
    totalTimer: number | null;
  }>({
    speakingTimer: null,
    totalTimer: null,
  });
  const prevNormalTimerRef = useRef<number | null>(null);

  const [isWarningBellOn, setWarningBell] = useState(false);
  const [isFinishBellOn, setFinishBell] = useState(false);
  useEffect(() => {
    const waringTime = 30;

    const isAnyTimerRunning =
      timer1.isRunning || timer2.isRunning || normalTimer.isRunning;

    const timerJustReached = (
      prevTime: number | null,
      currentTime: number | null,
      defaultTime: number | null,
    ) => {
      return (
        prevTime !== null &&
        prevTime > waringTime &&
        currentTime === waringTime &&
        defaultTime !== waringTime
      );
    };

    const isTimer1WarningTime =
      timer1.isRunning &&
      (timerJustReached(
        prevTimer1Ref.current.speakingTimer,
        timer1.speakingTimer,
        timer1.defaultTime.defaultSpeakingTimer,
      ) ||
        (timer1.speakingTimer === null &&
          timerJustReached(
            prevTimer1Ref.current.totalTimer,
            timer1.totalTimer,
            timer1.defaultTime.defaultTotalTimer,
          )));

    const isTimer2WarningTime =
      timer2.isRunning &&
      (timerJustReached(
        prevTimer2Ref.current.speakingTimer,
        timer2.speakingTimer,
        timer2.defaultTime.defaultSpeakingTimer,
      ) ||
        (timer2.speakingTimer === null &&
          timerJustReached(
            prevTimer2Ref.current.totalTimer,
            timer2.totalTimer,
            timer2.defaultTime.defaultTotalTimer,
          )));

    const isNormalTimerWarningTime =
      normalTimer.isRunning &&
      prevNormalTimerRef.current !== null &&
      prevNormalTimerRef.current > waringTime &&
      normalTimer.timer === waringTime &&
      normalTimer.defaultTimer !== waringTime;

    if (
      warningBellRef.current &&
      isAnyTimerRunning &&
      isWarningBellOn &&
      (isTimer1WarningTime || isTimer2WarningTime || isNormalTimerWarningTime)
    ) {
      warningBellRef.current.play();
    }

    // --- Finish Bell ---
    const isTimer1Finished =
      timer1.isRunning &&
      (timer1.speakingTimer === 0 || timer1.totalTimer === 0);

    const isTimer2Finished =
      timer2.isRunning &&
      (timer2.speakingTimer === 0 || timer2.totalTimer === 0);

    const isNormalTimerFinished =
      normalTimer.isRunning && normalTimer.timer === 0;

    const isAnyTimerFinished =
      isTimer1Finished || isTimer2Finished || isNormalTimerFinished;

    if (
      finishBellRef.current &&
      isAnyTimerRunning &&
      isFinishBellOn &&
      isAnyTimerFinished
    ) {
      finishBellRef.current.play();
    }

    prevTimer1Ref.current = {
      speakingTimer: timer1.speakingTimer,
      totalTimer: timer1.totalTimer,
    };
    prevTimer2Ref.current = {
      speakingTimer: timer2.speakingTimer,
      totalTimer: timer2.totalTimer,
    };
    prevNormalTimerRef.current = normalTimer.timer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    warningBellRef,
    finishBellRef,
    isWarningBellOn,
    isFinishBellOn,
    timer1.isRunning,
    timer2.isRunning,
    normalTimer.isRunning,
    timer1.speakingTimer,
    timer1.totalTimer,
    timer1.defaultTime.defaultTotalTimer,
    timer1.defaultTime.defaultSpeakingTimer,
    timer2.speakingTimer,
    timer2.totalTimer,
    timer2.defaultTime.defaultTotalTimer,
    timer2.defaultTime.defaultSpeakingTimer,
    normalTimer.timer,
    normalTimer.defaultTimer,
    prevTimer1Ref.current.speakingTimer,
    prevTimer1Ref.current.totalTimer,
    prevTimer2Ref.current.speakingTimer,
    prevTimer2Ref.current.totalTimer,
    prevNormalTimerRef.current,
  ]);

  return {
    warningBellRef,
    finishBellRef,
    isWarningBellOn,
    setWarningBell,
    isFinishBellOn,
    setFinishBell,
  };
}
