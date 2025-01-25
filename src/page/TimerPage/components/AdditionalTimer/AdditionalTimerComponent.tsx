import { useCallback, useEffect, useRef, useState } from 'react';
import TimerDisplay from '../common/TimerDisplay';
import AdditionalTimerController from './AdditionalTimerController';
import AdditionalTimerSummary from './AdditionalTimerSummary';
import { DebateInfo } from '../../../../type/type';

interface AdditionalTimerComponentProps {
  prevItem?: DebateInfo;
  currItem: DebateInfo;
  nextItem?: DebateInfo;
}

export default function AdditionalTimerComponent({
  prevItem,
  currItem,
  nextItem,
}: AdditionalTimerComponentProps) {
  // Load sounds
  const dingOnceRef = useRef<HTMLAudioElement>(null);
  const dingTwiceRef = useRef<HTMLAudioElement>(null);

  const [timer, setTimer] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isRunning, setRunning] = useState<boolean>(false);

  const startTimer = useCallback(() => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      setRunning(true);
    }
  }, []);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setRunning(false);
    }
  }, []);

  // Let timer play sounds when only 30 seconds left or timeout
  useEffect(() => {
    if (dingOnceRef.current && timer === 30 && intervalRef.current) {
      dingOnceRef.current.play();
    } else if (timer === 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      if (dingTwiceRef.current) dingTwiceRef.current.play();
    }
  }, [timer]);

  return (
    <div className="flex flex-col items-center space-y-12 px-12 pb-8">
      <audio ref={dingOnceRef} src="/sounds/ding-once-edit.mp3" />
      <audio ref={dingTwiceRef} src="/sounds/ding-twice-edit.mp3" />

      <h1 className="text-4xl font-bold">추가 작전 시간 타이머</h1>

      <TimerDisplay timer={timer} />
      <AdditionalTimerController
        isRunning={isRunning}
        addOnTimer={(value: number) =>
          setTimer((prev: number) => (prev + value > 0 ? prev + value : 0))
        }
        onPause={() => pauseTimer()}
        onStart={() => {
          if (timer > 0) startTimer();
        }}
      />
      <AdditionalTimerSummary
        prevItem={prevItem}
        currItem={currItem}
        nextItem={nextItem}
      />
    </div>
  );
}
