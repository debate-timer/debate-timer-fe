import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export function useFeedbackTimer(): FeedbackTimerLogics {
  // 타이머에 표시되는 현재 남은 시간
  const [timer, setTimer] = useState<number | null>(null);
  // 타이머 요청에 대한 ID를 저장
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 타이머의 총 시간
  const [defaultTimer, setDefaultTimer] = useState(0);

  // 타이머가 현재 동작중인지 여부
  const [isRunning, setIsRunning] = useState(false);

  // 실제 시간 계산용 레퍼런스
  const targetTimeRef = useRef<number | null>(null);

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
   * 타이머를 1초마다 1씩 감소시키며 시작
   * 이미 동작중이면 재시작하지 않음
   */
  const startTimer = useCallback(() => {
    if (intervalRef.current !== null || timer === null) return;

    const startTime = Date.now();
    targetTimeRef.current = startTime + timer * 1000;

    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      if (targetTimeRef.current === null) {
        return;
      }

      const now = Date.now();
      const remainingTotal = targetTimeRef.current - now;
      const remainingSeconds = Math.ceil(remainingTotal / 1000);

      if (remainingSeconds <= 0) {
        pauseTimer();
        setTimer(0);
        return;
      }

      setTimer(remainingSeconds);
    }, 200);
  }, [timer, pauseTimer]);

  /**
   * 타이머를 특정 값(혹은 기본값)으로 리셋
   */
  const resetTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimer(defaultTimer);
    setIsRunning(false);
  }, [defaultTimer]);

  /**
   * 타이머 시간을 조정 (타이머가 멈춰있을 때만)
   * @param amount - 추가하거나 뺄 시간 (초)
   */
  const adjustTime = useCallback(
    (amount: number) => {
      if (isRunning) return;

      setTimer((prevTimer) => {
        const newTime = (prevTimer ?? 0) + amount;
        return newTime < 0 ? 0 : newTime;
      });

      setDefaultTimer((prevDefault) => {
        const newDefault = prevDefault + amount;
        return newDefault < 0 ? 0 : newDefault;
      });
    },
    [isRunning],
  );

  // 컴포넌트가 언마운트될 때 setInterval로 인한 메모리 누수 방지
  useEffect(() => () => pauseTimer(), [pauseTimer]);

  return {
    timer,
    isRunning,
    defaultTimer,
    setTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    setDefaultTimer,
    adjustTime,
  };
}

export interface FeedbackTimerLogics {
  timer: number | null;
  isRunning: boolean;
  defaultTimer: number;
  setTimer: Dispatch<SetStateAction<number | null>>;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (value?: number) => void;
  setDefaultTimer: Dispatch<SetStateAction<number>>;
  adjustTime: (amount: number) => void;
}
