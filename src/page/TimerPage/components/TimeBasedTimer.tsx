import TimerController from './TimerController';
import { Formatting } from '../../../util/formatting';
import KeyboardKeyA from '../../../assets/keyboard/keyboard_key_A.png';
import KeyboardKeyL from '../../../assets/keyboard/keyboard_key_l.png';
import { TimeBasedStance, TimeBoxInfo } from '../../../type/type';
import CircularTimer from './CircularTimer';
import clsx from 'clsx';
import useCircularTimerAnimation from '../hooks/useCircularTimerAnimation';
import useBreakpoint from '../../../hooks/useBreakpoint';

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

  const breakpoint = useBreakpoint();
  const getStrokeWidth = () => {
    switch (breakpoint) {
      case 'xl':
        return 20;
      case 'lg':
        return 16;
      default:
        return 12;
    }
  };

  return (
    <div
      data-testid="timer"
      className={clsx(
        'flex w-[400px] flex-col items-center justify-center space-y-[12px] lg:w-[480px] lg:space-y-[16px] xl:min-w-[560px] xl:space-y-[20px]',
        {
          'pointer-events-none opacity-50 grayscale': !isSelected,
        },
      )}
    >
      {/* 제목 */}
      <section className="flex flex-row items-center justify-center space-x-[24px]">
        <h1 className="text-[48px] font-bold text-default-black lg:text-[56px] xl:text-[64px]">
          {teamName}
        </h1>
        <img
          src={prosCons === 'PROS' ? KeyboardKeyA : KeyboardKeyL}
          alt={prosCons === 'PROS' ? 'A키' : 'L키'}
          className="size-[44px] lg:size-[50px] xl:size-[56px]"
        />
      </section>

      {/* 타이머 */}
      <CircularTimer
        progress={progressMotionValue}
        stance={prosCons}
        strokeWidth={getStrokeWidth()}
        className="size-[400px] lg:size-[480px] xl:size-[560px]"
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
          <span className="flex w-full flex-col items-center justify-center p-[8px] lg:p-[12px] xl:p-[16px]">
            <h1 className="w-[88px] rounded-[8px] bg-default-black py-[6px] text-center text-[16px] text-default-white lg:w-[100px] lg:text-[18px] xl:w-[112px] xl:text-[20px]">
              전체 시간
            </h1>
            <span className="flex flex-row text-[56px] font-semibold text-default-black lg:text-[64px] xl:text-[72px]">
              <p className="flex w-[80px] items-center justify-center lg:w-[100px] xl:w-[120px]">
                {minute}
              </p>
              <p className="flex items-center justify-center">:</p>
              <p className="flex w-[80px] items-center justify-center lg:w-[100px] xl:w-[120px]">
                {second}
              </p>
            </span>

            <span className="h-[18px] lg:h-[24px] xl:h-[32px]"></span>

            <h1
              className={clsx(
                'w-[140px] rounded-[8px] py-[6px] text-center text-[20px] text-default-white lg:w-[160px] lg:text-[24px] xl:w-[180px] xl:text-[28px]',
                { 'bg-camp-blue': prosCons === 'PROS' },
                { 'bg-camp-red': prosCons === 'CONS' },
              )}
            >
              현재 시간
            </h1>
            <span className="flex flex-row text-[70px] font-bold text-default-black lg:text-[90px] xl:text-[110px]">
              <p className="flex w-[108px] items-center justify-center lg:w-[144px] xl:w-[180px]">
                {speakingMinute}
              </p>
              <p className="flex items-center justify-center">:</p>
              <p className="flex w-[108px] items-center justify-center lg:w-[144px] xl:w-[180px]">
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
