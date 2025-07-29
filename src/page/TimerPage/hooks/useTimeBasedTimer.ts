import {
  useCallback,
  useRef,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react';

/**
 * 토론에서 사용하는 커스텀 타이머 훅
 * - 전체시간, 전체시간 + 발언 당 시간(2가지) 모드 지원
 */
export function useTimeBasedTimer(): TimeBasedTimerLogics {
  // 전체 남은 시간 (null이면 타이머 미사용)
  const [totalTimer, setTotalTimer] = useState<number | null>(null);
  // 발언당 시간 타이머(=각 phase별 제한시간, 모드 전환 가능)
  const [speakingTimer, setSpeakingTimer] = useState<number | null>(null);
  const isSpeakingTimerAvailable = speakingTimer !== null;
  // 기본(초기) 시간값 (reset 등에서 참조)
  const [defaultTime, setDefaultTime] = useState<{
    defaultTotalTimer: number | null;
    defaultSpeakingTimer: number | null;
  }>({ defaultTotalTimer: 0, defaultSpeakingTimer: null });

  // 현재 타이머 동작중 여부
  const [isRunning, setIsRunning] = useState(false);
  // setInterval() 저장용 ref
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // 타이머가 0이 되면 true (완료 상태)
  const [isDone, setIsDone] = useState(false);

  // 리셋/롤백용: 최근 사용된(변경 직전) 값 저장
  const [savedTime, setSavedTime] = useState<{
    savedTotalTimer: number | null;
    savedSpeakingTimer: number | null;
  }>({ savedTotalTimer: 0, savedSpeakingTimer: null });

  // 실제 시간 계산용 레퍼런스
  const targetTimeRef = useRef<number | null>(null);
  const speakingTargetTimeRef = useRef<number | null>(null);

  /**
   * 타이머 시작을 위해 사용하는 저수준 함수
   */
  const setTimerInterval = useCallback(() => {
    // isRunning 상태를 true로 바꿔주고 인터벌 처리
    setIsRunning(true);

    // 목표 시각에 기반하여 타이머 계산
    intervalRef.current = setInterval(() => {
      // 목표 시각 레퍼런스의 유효성 확인
      if (targetTimeRef.current === null) {
        return;
      }

      // 현재 시각 확인
      const now = Date.now();

      // 목표 시각까지 얼마나 더 필요한지, 남은 시간을 초 단위로 계산
      const remainingTotal = targetTimeRef.current - now;
      const remainingSeconds = Math.max(0, Math.ceil(remainingTotal / 1000));

      // 계산한 남은 시간을 타이머에 반영
      setTotalTimer(remainingSeconds);
      setSavedTime((prev) => {
        return { ...prev, savedTotalTimer: remainingSeconds };
      });

      // 1회당 발언 시간 타이머도 사용하고 있을 경우, 마찬가지로 남은 시간 계산
      if (isSpeakingTimerAvailable) {
        if (speakingTargetTimeRef.current === null) {
          return;
        }

        const remainingSpeaking = speakingTargetTimeRef.current - now;
        const remainingSpeakingSeconds = Math.max(
          0,
          Math.ceil(remainingSpeaking / 1000),
        );
        setSpeakingTimer(remainingSpeakingSeconds);
        setSavedTime((prev) => {
          return { ...prev, savedSpeakingTimer: remainingSpeakingSeconds };
        });
      }
    }, 200);
  }, [isSpeakingTimerAvailable]);

  /**
   * 타이머 카운트다운 시작
   * - 이미 실행 중이면 무시
   * - isDone(완료) 상태일 땐 시작X
   * - 1초마다 totalTimer, speakingTimer(필요시) 감소
   */
  const startTimer = useCallback(() => {
    if (intervalRef.current !== null || totalTimer === null || isDone) {
      return;
    }

    // 목표 시각을 실제 시각 기반으로 계산
    // 예를 들어, 현재 시각이 오후 13시 00분 30초인데, 1회당 발언 시간이 30초라면,
    // 1회당 발언 시간이 모두 끝나는 시간은 13시 01분 00초이므로,
    // 해당 시간을 목표 시간으로 두는 식임
    const startTime = Date.now();
    targetTimeRef.current = startTime + totalTimer * 1000;
    if (isSpeakingTimerAvailable) {
      speakingTargetTimeRef.current = startTime + speakingTimer * 1000;
    }

    // 타이머 인터벌 시작
    setTimerInterval();
  }, [
    isDone,
    isSpeakingTimerAvailable,
    setTimerInterval,
    speakingTimer,
    totalTimer,
  ]);

  /**
   * 타이머 일시정지
   * - setInterval 해제, 동작 멈춤
   */
  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  /**
   * 최근 저장된 시간(savedTime)으로 복원
   */
  const resetCurrentTimer = useCallback(
    (isOpponentDone: boolean) => {
      // 초기화를 위해 타이머 정지
      pauseTimer();

      // 타이머가 초기화되었으니 이제부터는 당연히 다시 동작 가능하기 때문에,
      // isDone을 false로 설정
      setIsDone(false);

      // 전체 발언 시간 복원
      setTotalTimer(savedTime.savedTotalTimer);

      // 1회당 발언 시간 사용하는지 여부와 유효성 확인
      if (
        !isSpeakingTimerAvailable ||
        defaultTime.defaultSpeakingTimer === null ||
        totalTimer === null
      ) {
        return;
      }

      // 상대편 발언 종료 여부에 따라 1회당 발언 시간 다르게 계산
      if (isOpponentDone) {
        setSpeakingTimer(savedTime.savedTotalTimer);
      } else {
        setSpeakingTimer(savedTime.savedSpeakingTimer);
      }
    },
    [
      isSpeakingTimerAvailable,
      savedTime.savedSpeakingTimer,
      savedTime.savedTotalTimer,
      defaultTime.defaultSpeakingTimer,
      totalTimer,
      pauseTimer,
    ],
  );

  /**
   * 발언자 전환 시 타이머 리셋/초기화
   * - 발언 타이머 사용중이면 default값(또는 totalTimer 이하)로 재설정
   * - 전체 타이머는 초기값(defaultTotalTimer)로 리셋
   */
  const resetTimerForNextPhase = useCallback(
    (isOpponentDone: boolean): number => {
      if (
        isSpeakingTimerAvailable &&
        defaultTime.defaultSpeakingTimer !== null &&
        totalTimer !== null
      ) {
        // # 1회당 발언 시간을 사용할 경우

        // 다음 발언 시간 계산
        // - 상대방 시간 모두 소진 시, 남아있는 전체 발언 시간을 모두 1회당 발언 시간으로 사용
        // - 상대방 시간이 남았을 때, 1회당 발언 시간과 남은 전체 발언 시간 중 더 작은 것을 사용
        const nextSpeakingTime = isOpponentDone
          ? totalTimer
          : Math.min(totalTimer, defaultTime.defaultSpeakingTimer);

        // 계산한 시간을 1회당 발언 시간으로 설정
        setSpeakingTimer(nextSpeakingTime);
        return nextSpeakingTime;
      } else {
        // # 1회당 발언 시간을 사용하지 않을 경우

        // 전체 발언 시간 타이머는 초기값으로 리셋
        if (totalTimer === 0 || totalTimer === null) {
          return 0;
        }
        return totalTimer;
      }
    },
    [defaultTime.defaultSpeakingTimer, isSpeakingTimerAvailable, totalTimer],
  );

  /**
   * 발언자 전환 시 타이머 리셋/초기화 후 즉시 실행
   * - 발언 타이머 사용중이면 default값(또는 totalTimer 이하)로 재설정
   * - 전체 타이머는 초기값(defaultTotalTimer)로 리셋
   */
  const resetAndStartTimer = useCallback(
    (isOpponentDone: boolean) => {
      console.log(`# resetAndStartTimer 호출`);
      const newTime = resetTimerForNextPhase(isOpponentDone);

      if (intervalRef.current !== null || totalTimer === null || isDone) {
        return;
      }

      // 목표 시각을 실제 시각 기반으로 계산
      // 예를 들어, 현재 시각이 오후 13시 00분 30초인데, 1회당 발언 시간이 30초라면,
      // 1회당 발언 시간이 모두 끝나는 시간은 13시 01분 00초이므로,
      // 해당 시간을 목표 시간으로 두는 식임
      const startTime = Date.now();
      targetTimeRef.current = startTime + totalTimer * 1000;
      if (isSpeakingTimerAvailable) {
        speakingTargetTimeRef.current = startTime + newTime * 1000;
      }

      // 타이머 인터벌 시작
      setTimerInterval();
    },
    [
      resetTimerForNextPhase,
      setTimerInterval,
      isDone,
      isSpeakingTimerAvailable,
      totalTimer,
    ],
  );

  /**
   * 외부에서 전체/발언 타이머를 지정값으로 재설정
   * - start/pause 후 원하는 값 지정할 때 사용
   */
  const setTimers = useCallback(
    (total: number | null, speaking: number | null = null) => {
      pauseTimer();
      setTotalTimer(total);
      setSpeakingTimer(speaking);
    },
    [pauseTimer],
  );

  /**
   * 타이머 상태값 모두 초기화 (clear)
   * - phase 전환 등 모든 값 리셋할 때 사용
   */
  const clearTimer = useCallback(() => {
    pauseTimer();
    setDefaultTime({ defaultTotalTimer: 0, defaultSpeakingTimer: null });
    setTotalTimer(null);
    setSpeakingTimer(null);
    setIsDone(false);
    intervalRef.current = null;
  }, [pauseTimer]);

  useEffect(() => () => pauseTimer(), [pauseTimer]);

  return {
    totalTimer,
    speakingTimer,
    isRunning,
    isDone,
    defaultTime,
    isSpeakingTimerAvailable,
    startTimer,
    pauseTimer,
    resetTimerForNextPhase,
    resetAndStartTimer,
    resetCurrentTimer,
    setTimers,
    setSavedTime,
    setDefaultTime,
    setIsDone,
    clearTimer,
  };
}

export interface TimeBasedTimerLogics {
  totalTimer: number | null;
  speakingTimer: number | null;
  isRunning: boolean;
  isDone: boolean;
  defaultTime: {
    defaultTotalTimer: number | null;
    defaultSpeakingTimer: number | null;
  };
  isSpeakingTimerAvailable: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimerForNextPhase: (isOpponentDone: boolean) => number;
  resetAndStartTimer: (isOpponentDone: boolean) => void;
  resetCurrentTimer: (isOpponentDone: boolean) => void;
  setTimers: (total: number | null, speaking?: number | null) => void;
  setSavedTime: Dispatch<
    SetStateAction<{
      savedTotalTimer: number | null;
      savedSpeakingTimer: number | null;
    }>
  >;
  setDefaultTime: Dispatch<
    SetStateAction<{
      defaultTotalTimer: number | null;
      defaultSpeakingTimer: number | null;
    }>
  >;
  setIsDone: Dispatch<SetStateAction<boolean>>;
  clearTimer: () => void;
}
