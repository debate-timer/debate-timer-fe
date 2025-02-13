import { useEffect, useRef } from 'react';
import TimerDisplay from '../common/TimerDisplay';
import AdditionalTimerController from './AdditionalTimerController';
import AdditionalTimerSummary from './AdditionalTimerSummary';
import { TimeBoxInfo } from '../../../../type/type';
import { useTimer } from '../../hooks/useTimer';

interface AdditionalTimerComponentProps {
  prevItem?: TimeBoxInfo;
  currItem: TimeBoxInfo;
  nextItem?: TimeBoxInfo;
}

export default function AdditionalTimerComponent({
  prevItem,
  currItem,
  nextItem,
}: AdditionalTimerComponentProps) {
  // Load sounds
  const dingOnceRef = useRef<HTMLAudioElement>(null);
  const dingTwiceRef = useRef<HTMLAudioElement>(null);

  const { timer, isRunning, startTimer, pauseTimer, setTimer, actOnTime } =
    useTimer();

  // Let timer play sounds when only 30 seconds left or timeout
  useEffect(() => {
    actOnTime(30, () => {
      if (dingOnceRef.current && isRunning) {
        dingOnceRef.current.play();
      }
    });

    actOnTime(0, () => {
      if (dingTwiceRef.current && isRunning) {
        dingTwiceRef.current.play();
      }
    });
  }, [actOnTime, isRunning]);

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
