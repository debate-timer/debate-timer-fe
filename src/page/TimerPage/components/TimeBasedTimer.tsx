import TimerController from './TimerController';
import { Formatting } from '../../../util/formatting';
import KeyboardKeyA from '../../../assets/keyboard/keyboard_key_A.png';
import KeyboardKeyL from '../../../assets/keyboard/keyboard_key_l.png';
import { TimeBasedStance, TimeBoxInfo } from '../../../type/type';
import CircularTimer from './CircularTimer';
import clsx from 'clsx';
import useCircularTimerAnimation from '../hooks/useCircularTimerAnimation';

type TimeBasedTimerInstance = {
  totalTimer: number | null;
  speakingTimer: number | null;
  isRunning: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetCurrentTimer: () => void;
};

interface TimeBasedTimerProps {
  timeBasedTimerInstance: TimeBasedTimerInstance;
  isSelected: boolean;
  onActivate?: () => void;
  prosCons: TimeBasedStance;
  teamName: string;
  item: TimeBoxInfo;
}

export default function TimeBasedTimer({
  timeBasedTimerInstance,
  isSelected,
  prosCons,
  teamName,
  item,
}: TimeBasedTimerProps) {
  const {
    totalTimer,
    speakingTimer,
    isRunning,
    startTimer,
    pauseTimer,
    resetCurrentTimer,
  } = timeBasedTimerInstance;
  const minute = Formatting.formatTwoDigits(
    Math.floor(Math.abs(totalTimer ?? 0) / 60),
  );
  const second = Formatting.formatTwoDigits(Math.abs((totalTimer ?? 0) % 60));

  const speakingMinute = Formatting.formatTwoDigits(
    Math.floor(Math.abs((speakingTimer ?? 0) / 60)),
  );
  const speakingSecond = Formatting.formatTwoDigits(
    Math.abs((speakingTimer ?? 0) % 60),
  );

  const initRawProgress = (): number => {
    if (speakingTimer === null) {
      if (item.timePerTeam && item.timePerTeam > 0 && totalTimer) {
        return ((item.timePerTeam - totalTimer) / item.timePerTeam) * 100;
      }
    } else if (
      item.timePerSpeaking &&
      item.timePerSpeaking > 0 &&
      speakingTimer
    ) {
      return (
        ((item.timePerSpeaking - speakingTimer) / item.timePerSpeaking) * 100
      );
    }

    return 0;
  };

  const rawProgress = initRawProgress();
  const progressMotionValue = useCircularTimerAnimation(rawProgress);

  return (
    <div
      data-testid="timer"
      className={clsx(
        'flex min-w-[560px] flex-col items-center justify-center space-y-[18px]',
        {
          'pointer-events-none opacity-50 grayscale': !isSelected,
        },
      )}
    >
      {/* 제목 */}
      <section className="flex flex-row items-center justify-center space-x-[24px]">
        <h1 className="text-[68px] font-bold text-default-black">{teamName}</h1>
        <img
          src={prosCons === 'PROS' ? KeyboardKeyA : KeyboardKeyL}
          alt={prosCons === 'PROS' ? 'A키' : 'L키'}
          className="size-[56px]"
        />
      </section>

      {/* 타이머 */}
      <CircularTimer
        progress={progressMotionValue}
        stance={prosCons}
        size={560}
        strokeWidth={20}
      >
        {/* 1회당 발언 시간 X */}
        {speakingTimer === null && (
          <span className="flex w-full flex-row items-center justify-center space-x-[16px] p-[16px] text-[110px] font-bold text-default-black">
            <p className="flex flex-1 items-center justify-center">{minute}</p>
            <p className="flex items-center justify-center">:</p>
            <p className="flex flex-1 items-center justify-center">{second}</p>
          </span>
        )}

        {/* 1회당 발언 시간 O */}
        {speakingTimer !== null && (
          <span className="flex w-full flex-col items-center justify-center p-[16px]">
            <h1 className="w-[112px] rounded-[8px] bg-default-black py-[6px] text-center text-[20px] text-default-white">
              전체 시간
            </h1>
            <span className="flex flex-row text-[72px] font-semibold text-default-black">
              <p className="flex w-[120px] items-center justify-center">
                {minute}
              </p>
              <p className="flex items-center justify-center">:</p>
              <p className="flex w-[120px] items-center justify-center">
                {second}
              </p>
            </span>

            <span className="h-[32px]"></span>

            <h1
              className={clsx(
                'w-[180px] rounded-[8px] py-[6px] text-center text-[28px] text-default-white',
                { 'bg-camp-blue': prosCons === 'PROS' },
                { 'bg-camp-red': prosCons === 'CONS' },
              )}
            >
              현재 시간
            </h1>
            <span className="flex flex-row text-[110px] font-bold text-default-black">
              <p className="flex w-[180px] items-center justify-center">
                {speakingMinute}
              </p>
              <p className="flex items-center justify-center">:</p>
              <p className="flex w-[180px] items-center justify-center">
                {speakingSecond}
              </p>
            </span>
          </span>
        )}
      </CircularTimer>

      {/* 조작부 */}
      <TimerController
        isRunning={isRunning}
        onStart={startTimer}
        onPause={pauseTimer}
        onReset={resetCurrentTimer}
        stance={prosCons}
      />
    </div>
  );
}
