import { useEffect, useRef, useState } from 'react';
import { DebateInfo } from '../../../type/type';
import { Formatting } from '../../../util/formatting';
import Timer from './Timer/Timer';
import TimerController from './Timer/TimerController';
import useSound from 'use-sound';
import dingOnce from '/sounds/ding-once-edit.mp3';
import dingTwice from '/sounds/ding-twice-edit.mp3';
import { IoPerson } from 'react-icons/io5';

interface TimerComponentProps {
  debateInfo: DebateInfo;
  increaseIndex: (max: number) => void;
  decreaseIndex: () => void;
  setBg: (newValue: string) => void;
}

// Define timer's state:
// - PAUSED: When timer is paused
// - STOPPED: When timer is rendered or reset
// - RUNNING: When timer is running
export type TimerState = 'PAUSED' | 'STOPPED' | 'RUNNING';

// Main timer component that user can control
export default function TimerComponent({
  debateInfo,
  increaseIndex,
  decreaseIndex,
  setBg,
}: TimerComponentProps) {
  // Load sounds
  const [dingOnceSfx] = useSound(dingOnce);
  const [dingTwiceSfx] = useSound(dingTwice);

  // Declare states
  const [timerState, setTimerState] = useState<TimerState>('STOPPED');
  const [timer, setTimer] = useState<number>(debateInfo.time);
  const intervalRef = useRef<number | null>(null);

  // Set texts to be displayed
  const titleText =
    debateInfo.type !== 'TIME_OUT'
      ? `${Formatting.formatStanceToString(debateInfo.stance)} ${Formatting.formatDebateTypeToString(debateInfo.type)}`
      : Formatting.formatDebateTypeToString(debateInfo.type);
  const speakerText =
    debateInfo.stance === 'NEUTRAL'
      ? ''
      : `${debateInfo.speakerNumber}번 발언자`;

  // Set background color by debateInfo's stance
  const bgColor =
    debateInfo.stance === 'NEUTRAL'
      ? 'bg-zinc-500'
      : debateInfo.stance === 'PROS'
        ? 'bg-blue-500'
        : 'bg-red-500';

  // Let timer play sounds when only 30 seconds left or timeout
  useEffect(() => {
    if (timer === 30) {
      dingOnceSfx();
    } else if (timer === 0) {
      dingTwiceSfx();
    }
  });

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
    setTimer(debateInfo.time);
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
      increaseIndex(debateInfo.time);
    }
    resetTimer();
  };

  // Set parant component's background animation by timer's state and remaining time
  if (timerState !== 'RUNNING') {
    setBg('');
  } else {
    if (timer > 30) {
      setBg('gradient-timer-running');
    } else if (timer <= 30 && timer > 0) {
      setBg('gradient-timer-warning');
    } else {
      setBg('gradient-timer-timeout');
    }
  }

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

  // Return React component
  return (
    <div
      className={`flex flex-col items-center rounded-[50px] border-4 border-zinc-50 px-24 py-8 shadow-2xl ${bgColor}`}
    >
      {/* Title */}
      <div className="m-2 mb-16 flex flex-col items-center space-y-3">
        <h1 className="text-6xl font-bold text-zinc-50">{titleText}</h1>
        <div className="flex flex-row items-center space-x-3 text-zinc-50">
          {debateInfo.stance !== 'NEUTRAL' && (
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
  );
}
