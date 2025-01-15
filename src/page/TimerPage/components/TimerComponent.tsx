import { useEffect, useRef, useState } from 'react';
import {
  DebateInfo,
  DebateTypeToString,
  StanceToString,
} from '../../../type/type';
import Timer from './Timer/Timer';
import TimerController from './Timer/TimerController';
/*
import useSound from 'use-sound';
import dingOnce from '/sounds/ding-once-edit.mp3';
import dingTwice from '/sounds/ding-twice-edit.mp3';
*/
import { IoPerson } from 'react-icons/io5';
import DebateInfoSummary from './DebateInfoSummary';

interface TimerComponentProps {
  className?: string;
  debateInfoList: DebateInfo[];
  index: number;
  increaseIndex: () => void;
  decreaseIndex: () => void;
  updateBg: (newValue: string) => void;
}

// Define timer's state:
// - PAUSED: When timer is paused
// - STOPPED: When timer is rendered or reset
// - RUNNING: When timer is running
export type TimerState = 'PAUSED' | 'STOPPED' | 'RUNNING';

// Main timer component that user can control
export default function TimerComponent({
  className,
  debateInfoList,
  index,
  increaseIndex,
  decreaseIndex,
  updateBg,
}: TimerComponentProps) {
  // Load sounds
  const dingOnceRef = useRef<HTMLAudioElement>(null);
  const dingTwiceRef = useRef<HTMLAudioElement>(null);

  // Declare states
  const [timerState, setTimerState] = useState<TimerState>('STOPPED');
  const [timer, setTimer] = useState<number>(debateInfoList[index].time);
  const intervalRef = useRef<number | null>(null);

  // Set texts to be displayed
  const titleText =
    debateInfoList[index].type !== 'TIME_OUT'
      ? `${StanceToString[debateInfoList[index].stance]} ${DebateTypeToString[debateInfoList[index].type]}`
      : DebateTypeToString[debateInfoList[index].type];
  const speakerText =
    debateInfoList[index].stance === 'NEUTRAL'
      ? ''
      : `${debateInfoList[index].speakerNumber}번 발언자`;

  // Set background color by debateInfo's stance
  const bgColor =
    debateInfoList[index].stance === 'NEUTRAL'
      ? 'bg-zinc-500'
      : debateInfoList[index].stance === 'PROS'
        ? 'bg-blue-500'
        : 'bg-red-500';

  // Declare functions to handle timer
  const startTimer = () => {
    if (intervalRef.current) return;

    setTimerState('RUNNING');
    intervalRef.current = window.setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
  };
  const pauseTimer = () => {
    setTimerState('PAUSED');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  const resetTimer = () => {
    setTimerState('STOPPED');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Declare function to manage parant component's index
  const moveToOtherItem = (isPrev: boolean) => {
    if (isPrev) {
      decreaseIndex();
    } else {
      increaseIndex();
    }
    resetTimer();
  };

  // Set parant component's background animation by timer's state and remaining time
  useEffect(() => {
    if (timerState !== 'RUNNING') {
      updateBg('');
    } else {
      if (timer > 30) {
        updateBg('gradient-timer-running');
      } else if (timer <= 30 && timer > 0) {
        updateBg('gradient-timer-warning');
      } else {
        updateBg('gradient-timer-timeout');
      }
    }
  }, [timerState, timer, updateBg]);

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'Space':
          if (timerState === 'RUNNING') {
            pauseTimer();
          } else {
            startTimer();
          }
          break;
        case 'ArrowLeft':
          moveToOtherItem(true);
          break;
        case 'ArrowRight':
          moveToOtherItem(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  // Let timer play sounds when only 30 seconds left or timeout
  useEffect(() => {
    if (dingOnceRef.current && timer === 30) {
      dingOnceRef.current.play();
    } else if (dingTwiceRef.current && timer === 0) {
      dingTwiceRef.current.play();
    }
  });

  // Let timer be initiated with default time that is defined in current debateInfo's time when index is changed
  useEffect(() => {
    setTimer(debateInfoList[index].time);
    // console.log(`# Timer has set to index ${index} and ${debateInfoList[index].time}`);
  }, [debateInfoList, setTimer, index]);

  // Return React component
  return (
    <div className="flex h-full flex-row items-center space-x-4">
      <audio ref={dingOnceRef} src="/sounds/ding-once-edit.mp3" />
      <audio ref={dingTwiceRef} src="/sounds/ding-twice-edit.mp3" />

      <div className="flex-1">
        {index !== 0 && (
          <DebateInfoSummary
            isPrev={true}
            moveToOtherItem={(isPrev: boolean) => {
              moveToOtherItem(isPrev);
            }}
            debateInfo={debateInfoList[index - 1]}
          />
        )}
        {index === 0 && <div className="m-8 w-[240px]"></div>}
      </div>

      <div
        className={`flex w-min flex-col items-center rounded-[50px] border-4 border-zinc-50 px-8 py-8 shadow-2xl ${bgColor} ${className !== undefined ? className : ''}`}
      >
        {/* Title */}
        <div className="m-2 mb-8 flex flex-col items-center space-y-3">
          <h1 className="text-6xl font-bold text-zinc-50">{titleText}</h1>
          <div className="flex flex-row items-center space-x-3 text-zinc-50">
            {debateInfoList[index].stance !== 'NEUTRAL' && (
              <IoPerson className="size-[25px]" />
            )}
            <h1 className="text-3xl">{speakerText}</h1>
          </div>
        </div>

        {/* Timer */}
        <Timer timer={timer} />

        {/* Timer controller that includes buttons that can handle timer */}
        <TimerController
          onReset={resetTimer}
          onStart={startTimer}
          onPause={pauseTimer}
          toOtherItem={moveToOtherItem}
        />
      </div>

      <div className="flex-1">
        {index !== debateInfoList.length - 1 && (
          <DebateInfoSummary
            isPrev={false}
            moveToOtherItem={(isPrev: boolean) => {
              moveToOtherItem(isPrev);
            }}
            debateInfo={debateInfoList[index + 1]}
          />
        )}
        {index === debateInfoList.length - 1 && (
          <div className="m-8 w-[240px]"></div>
        )}
      </div>
    </div>
  );
}
