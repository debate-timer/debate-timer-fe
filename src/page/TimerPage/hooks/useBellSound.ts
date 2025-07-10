import { useEffect, useRef, useState } from 'react';
import { TimeBasedTimerLogics } from './useTimeBasedTimer';
import { NormalTimerLogics } from './useNormalTimer';

interface UseBellSoundProps {
  timer1: TimeBasedTimerLogics;
  timer2: TimeBasedTimerLogics;
  normalTimer: NormalTimerLogics;
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

  // 이전 타이머 상태를 기억하여 변화 시점을 감지하기 위한 ref(30초로 변경되는 시점 종소리를 위한)
  const prevTimer1Ref = useRef({
    speakingTimer: null as number | null,
    totalTimer: null as number | null,
  });
  const prevTimer2Ref = useRef({
    speakingTimer: null as number | null,
    totalTimer: null as number | null,
  });
  const prevNormalTimerRef = useRef<number | null>(null);

  const [isWarningBellOn, setWarningBell] = useState(isWarningBell);
  const [isFinishBellOn, setFinishBell] = useState(isFinishBell);
  const warningTime = 30;

  // 30초 경고음 진입 조건 함수
  function timerJustReached(
    prevTime: number | null,
    currentTime: number | null,
    defaultTime: number | null,
  ) {
    return (
      prevTime !== null &&
      prevTime > warningTime &&
      currentTime === warningTime &&
      defaultTime !== warningTime
    );
  }

  // 자유토론(TimeBased) 타이머 경고음 조건 체크
  function isTimerWarningTime(
    timer: TimeBasedTimerLogics,
    prevTimer: { speakingTimer: number | null; totalTimer: number | null },
  ) {
    return (
      timer.isRunning &&
      (timerJustReached(
        prevTimer.speakingTimer,
        timer.speakingTimer,
        timer.defaultTime.defaultSpeakingTimer,
      ) ||
        (timer.speakingTimer === null &&
          timerJustReached(
            prevTimer.totalTimer,
            timer.totalTimer,
            timer.defaultTime.defaultTotalTimer,
          )))
    );
  }

  // 일반타이머 경고음 조건 체크
  function isNormalTimerWarningTime(
    timer: NormalTimerLogics,
    prevNormalTimer: number | null,
  ) {
    return (
      timer.isRunning &&
      prevNormalTimer !== null &&
      prevNormalTimer > warningTime &&
      timer.timer === warningTime &&
      timer.defaultTimer !== warningTime
    );
  }

  // 종료음 조건 체크
  function isTimerFinished(timer: TimeBasedTimerLogics) {
    return (
      timer.isRunning && (timer.speakingTimer === 0 || timer.totalTimer === 0)
    );
  }
  function isNormalTimerFinished(timer: NormalTimerLogics) {
    return timer.isRunning && timer.timer === 0;
  }

  // 이전값(ref) 최신화 함수
  function updatePrevTimers() {
    prevTimer1Ref.current = {
      speakingTimer: timer1.speakingTimer,
      totalTimer: timer1.totalTimer,
    };
    prevTimer2Ref.current = {
      speakingTimer: timer2.speakingTimer,
      totalTimer: timer2.totalTimer,
    };
    prevNormalTimerRef.current = normalTimer.timer;
  }

  // 벨 재생 함수
  function playWarningBell() {
    if (warningBellRef.current) warningBellRef.current.play();
  }
  function playFinishBell() {
    if (finishBellRef.current) finishBellRef.current.play();
  }

  // ===== useEffect 메인 =====
  useEffect(() => {
    const isAnyTimerRunning =
      timer1.isRunning || timer2.isRunning || normalTimer.isRunning;

    const isTimer1WarningTime = isTimerWarningTime(
      timer1,
      prevTimer1Ref.current,
    );
    const isTimer2WarningTime = isTimerWarningTime(
      timer2,
      prevTimer2Ref.current,
    );
    const isNormalWarningTime = isNormalTimerWarningTime(
      normalTimer,
      prevNormalTimerRef.current,
    );

    // ------ 경고음(warningBell) ------
    if (
      isAnyTimerRunning &&
      isWarningBellOn &&
      (isTimer1WarningTime || isTimer2WarningTime || isNormalWarningTime)
    ) {
      playWarningBell();
    }

    // ------ 종료음(finishBell) ------
    const isTimer1Finished = isTimerFinished(timer1);
    const isTimer2Finished = isTimerFinished(timer2);
    const isNormalTimerFin = isNormalTimerFinished(normalTimer);
    const isAnyTimerFinished =
      isTimer1Finished || isTimer2Finished || isNormalTimerFin;

    if (isAnyTimerRunning && isFinishBellOn && isAnyTimerFinished) {
      playFinishBell();
    }

    updatePrevTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
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
