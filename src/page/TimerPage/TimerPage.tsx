import { useState, useRef, useEffect } from 'react';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { DebateInfo } from '../../type/type';
import DebateInfoSummary from './components/DebateInfoSummary';
import TimerComponent from './components/TimerComponent';
import dingOnce from '/sounds/ding-once-edit.mp3';
import dingTwice from '/sounds/ding-twice-edit.mp3';
import useSound from 'use-sound';

interface TimerPageProps {
  debateInfoItems: DebateInfo[];
}

export type TimerState = 'STOPPED' | 'RESET' | 'RUNNING';

export default function TimerPage({ debateInfoItems }: TimerPageProps) {
  const [dingOnceSfx] = useSound(dingOnce);
  const [dingTwiceSfx] = useSound(dingTwice);
  const [index, setIndex] = useState<number>(0);
  const [timerState, setTimerState] = useState<TimerState>('RESET');
  const [timer, setTimer] = useState<number>(debateInfoItems[index].time);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (timer === 30) {
      dingOnceSfx();
    } else if (timer === 0) {
      dingTwiceSfx();
    }
  });

  const startTimer = () => {
    if (intervalRef.current) return;

    setTimerState('RUNNING');
    intervalRef.current = window.setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
  };
  const stopTimer = () => {
    setTimerState('STOPPED');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  const resetTimer = () => {
    setTimerState('RESET');
    setTimer(debateInfoItems[index].time);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  const moveToOtherItem = (isPrev: boolean) => {
    if (isPrev) {
      decreaseIndex();
    } else {
      increaseIndex();
    }
    resetTimer();
  };
  const increaseIndex = () => {
    console.log(`# index = ${index}`);
    if (index >= debateInfoItems.length) {
      return;
    }
    setIndex(index + 1);
  };
  const decreaseIndex = () => {
    console.log(`# index = ${index}`);
    if (index <= 0) {
      return;
    }
    setIndex(index - 1);
  };
  let bg: string;

  if (timerState !== 'RUNNING') {
    bg = '';
  } else {
    if (timer > 30) {
      bg = 'gradient-timer-running';
    } else if (timer <= 30 && timer > 0) {
      bg = 'gradient-timer-warning';
    } else {
      bg = 'gradient-timer-timeout';
    }
  }

  return (
    <div className="relative h-full w-full">
      <div
        className={`absolute inset-0 h-full w-full animate-gradient opacity-80 ${bg}`}
      />
      <DefaultLayout>
        {/* Header */}
        <DefaultLayout.Header>
          <DefaultLayout.Header.Left>왼쪽</DefaultLayout.Header.Left>
          <DefaultLayout.Header.Center>가운데</DefaultLayout.Header.Center>
          <DefaultLayout.Header.Right>오른쪽</DefaultLayout.Header.Right>
        </DefaultLayout.Header>

        {/* Content */}
        <DefaultLayout.ContentContanier>
          <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
            <TimerComponent
              debateInfo={debateInfoItems[index]}
              timer={timer}
              resetTimer={resetTimer}
              startTimer={startTimer}
              stopTimer={stopTimer}
              moveToOtherItem={moveToOtherItem}
            />
          </div>
        </DefaultLayout.ContentContanier>

        {/* Footer */}
        <DefaultLayout.StickyFooterWrapper>
          <div className="flex w-full flex-row justify-between">
            <div className="flex">
              {index !== 0 && (
                <DebateInfoSummary
                  isPrev={true}
                  debateInfo={debateInfoItems[index - 1]}
                />
              )}
            </div>
            <div className="flex">
              {index !== debateInfoItems.length - 1 && (
                <DebateInfoSummary
                  isPrev={false}
                  debateInfo={debateInfoItems[index + 1]}
                />
              )}
            </div>
          </div>
        </DefaultLayout.StickyFooterWrapper>
      </DefaultLayout>
    </div>
  );
}
