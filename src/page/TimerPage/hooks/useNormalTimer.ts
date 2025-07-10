import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

/**
 * "일반 타이머" 기능을 제공하는 커스텀 훅
 * - 한 명(한 팀)만 시간을 쓰는 단일 타이머 상황에서 사용
 */
export function useNormalTimer() {
  // 타이머에 표시할 '남은 시간'(초)
  const [timer, setTimer] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // 타이머가 초기화될 때 사용하는 '기본 시간값' (reset 시 사용)
  const [defaultTimer, setDefaultTimer] = useState(0);

  // 타이머가 현재 동작중인지 여부
  const [isRunning, setIsRunning] = useState(false);

  // 작전 시간 타이머 작동 여부
  const [isAdditionalTimerOn, setIsAdditionalTimerOn] = useState(false);
  const [savedTimer, setSavedTimer] = useState(0);

  /**
   * 타이머를 1초마다 1씩 감소시키며 시작
   * 이미 동작중이면 재시작하지 않음
   */
  const startTimer = useCallback(() => {
    if (intervalRef.current !== null) return;
    intervalRef.current = setInterval(() => {
      setTimer((prev) => (prev === null ? null : prev - 1));
    }, 1000);
    setIsRunning(true);
  }, []);

  /**
   * 타이머 일시정지 (setInterval 해제)
   */
  const pauseTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  /**
   * 타이머를 특정 값(혹은 기본값)으로 리셋
   * (interval 정리, 남은 시간 초기화)
   */
  const resetTimer = useCallback(
    (value?: number) => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // 값이 있으면 그 값으로, 없으면 defaultTimer로 세팅
      setTimer(value !== undefined ? value : defaultTimer);
      setIsRunning(false);
    },
    [defaultTimer],
  );

  /**
   * 모든 타이머 상태 초기화
   * (타이머 값, default값, setInterval 핸들 모두 초기화)
   */
  const clearTimer = useCallback(() => {
    pauseTimer();
    setTimer(null);
    setDefaultTimer(0);
    intervalRef.current = null;
  }, [pauseTimer]);

  /**
   * 작전시간 타이머 사용 시, 기존 타이머 저장
   */
  const handleChangeAdditionalTimer = useCallback(() => {
    pauseTimer();
    if (!isAdditionalTimerOn) {
      setSavedTimer(timer ?? 0);
      setTimer(0);
    } else {
      setTimer(savedTimer);
    }
    setIsAdditionalTimerOn(!isAdditionalTimerOn);
  }, [isAdditionalTimerOn, pauseTimer, setTimer, savedTimer, timer]);

  /**
   * 작전시간 타이머 사용 시, 기존 타이머 저장
   */
  const handleCloseAdditionalTimer = useCallback(() => {
    setIsAdditionalTimerOn(false);
  }, []);
  //작전시간 종료 시, 자동으로 타이머 변경
  useEffect(() => {
    if (isAdditionalTimerOn && timer === 0 && isRunning) {
      pauseTimer();
      setTimer(savedTimer);
      setIsAdditionalTimerOn(false);
    }
  }, [
    isAdditionalTimerOn,
    timer,
    savedTimer,
    pauseTimer,
    setIsAdditionalTimerOn,
    setTimer,
    isRunning,
  ]);
  useEffect(() => () => pauseTimer(), [pauseTimer]);

  return {
    timer,
    isRunning,
    defaultTimer,
    isAdditionalTimerOn,
    setTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    setDefaultTimer,
    clearTimer,
    handleChangeAdditionalTimer,
    handleCloseAdditionalTimer,
  };
}

export interface NormalTimerLogics {
  timer: number | null;
  isRunning: boolean;
  defaultTimer: number;
  isAdditionalTimerOn: boolean;
  setTimer: Dispatch<SetStateAction<number | null>>;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (value?: number) => void;
  setDefaultTimer: Dispatch<SetStateAction<number>>;
  clearTimer: () => void;
  handleChangeAdditionalTimer: () => void;
  handleCloseAdditionalTimer: () => void;
}
