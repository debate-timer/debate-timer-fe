import { useEffect, useRef, useState } from 'react';
import { UseCustomTimerReturnType } from './useCustomTimer';
import { UseNormalTimerReturnType } from './useNormalTimer';

interface UseBellSoundProps {
  timer1: UseCustomTimerReturnType;
  timer2: UseCustomTimerReturnType;
  normalTimer: UseNormalTimerReturnType;
  isWarningBell?: boolean;
  isFinishBell?: boolean;
}

/**
 * 토론 타이머에서 경고/종료 벨 사운드를 자동 재생해주는 커스텀 훅
 * - 타이머 상태 변화(30초, 0초 등)에 따라 지정된 벨 사운드가 한 번씩 재생됨
 */
export function useBellSound({
  timer1,
  timer2,
  normalTimer,
  isWarningBell = false,
  isFinishBell = false,
}: UseBellSoundProps) {
  // 오디오 태그를 참조하기 위한 ref (컴포넌트에서 <audio ref={...} />로 연결)
  const warningBellRef = useRef<HTMLAudioElement>(null);
  const finishBellRef = useRef<HTMLAudioElement>(null);

  // 이전 타이머 상태를 기억하여 변화 시점을 감지하기 위한 ref
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

  // 벨 On/Off 여부 상태
  const [isWarningBellOn, setWarningBell] = useState(false);
  const [isFinishBellOn, setFinishBell] = useState(false);

  useEffect(() => {
    const waringTime = 30;

    // 하나라도 타이머가 동작 중인지 체크
    const isAnyTimerRunning =
      timer1.isRunning || timer2.isRunning || normalTimer.isRunning;

    /**
     * 30초 경고음 재생 조건을 만족하는지 판단하는 함수
     * - "30초"로 처음 진입할 때만 true 반환
     */
    const timerJustReached = (
      prevTime: number | null,
      currentTime: number | null,
      defaultTime: number | null,
    ) => {
      return (
        prevTime !== null &&
        prevTime > waringTime &&
        currentTime === waringTime &&
        defaultTime !== waringTime // (처음부터 30초면 울리지 않게)
      );
    };

    // 각각의 타이머가 "경고음 조건"에 진입했는지 계산
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

    // ------ 경고음(warningBell) 재생 ------
    if (
      warningBellRef.current &&
      isAnyTimerRunning &&
      isWarningBellOn &&
      (isTimer1WarningTime || isTimer2WarningTime || isNormalTimerWarningTime)
    ) {
      warningBellRef.current.play();
    }

    // ------ 종료음(finishBell) 재생 ------
    // (각 타이머별 0초에 도달했는지 체크)
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

    // --- 이전값(ref) 최신화 ---
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

  // 외부 상태/props에서 벨 활성화 여부를 받아옴 (처음 or 값 변경 시 반영)
  useEffect(() => {
    setWarningBell(isWarningBell);
    setFinishBell(isFinishBell);
  }, [isWarningBell, isFinishBell]);

  return {
    warningBellRef,
    finishBellRef,
    isWarningBellOn,
    setWarningBell,
    isFinishBellOn,
    setFinishBell,
  };
}
