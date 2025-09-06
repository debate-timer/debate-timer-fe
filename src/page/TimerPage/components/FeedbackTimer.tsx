import TimerController from './TimerController';
import { Formatting } from '../../../util/formatting';
import CircularTimer from './CircularTimer';
import clsx from 'clsx';
import useCircularTimerAnimation from '../hooks/useCircularTimerAnimation';
import useBreakpoint from '../../../hooks/useBreakpoint';
import { FeedbackTimerLogics } from '../hooks/useFeedbackTimer';

interface FeedbackTimerProps {
  feedbackTimerInstance: FeedbackTimerLogics;
}

const timeAdjustments = [
  { label: '-5분', value: -300 },
  { label: '-1분', value: -60 },
  { label: '+1분', value: 60 },
  { label: '+5분', value: 300 },
];

export default function FeedbackTimer({
  feedbackTimerInstance,
}: FeedbackTimerProps) {
  const {
    timer,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    adjustTime,
    defaultTimer,
  } = feedbackTimerInstance;

  const totalTime = timer ?? 0;
  const { minutes, seconds } = Formatting.formatSecondsToMinutes(totalTime);
  const minute = Formatting.formatTwoDigits(minutes);
  const second = Formatting.formatTwoDigits(seconds);
  const rawProgress =
    timer !== null && defaultTimer > 0
      ? ((defaultTimer - timer) / defaultTimer) * 100
      : 0;
  const progressMotionValue = useCircularTimerAnimation(rawProgress);
  const breakpoint = useBreakpoint();

  const getStrokeWidth = () => {
    switch (breakpoint) {
      case 'xl':
        return 20;
      default:
        return 12;
    }
  };

  return (
    <div className="flex flex-row items-center space-x-[80px]">
      {/* 좌측 영역 */}
      <div className="flex h-[186px] w-[466px] flex-shrink-0 flex-col items-center justify-center space-y-[20px] px-[45px] xl:space-y-[36px]">
        {/* 제목 */}
        <h1 className="text-[52px] font-bold xl:text-[68px]">피드백 타이머</h1>

        {/* 시간 조절 버튼 */}
        <div className="flex w-[466px] flex-row gap-[22px] pt-[24px]">
          {timeAdjustments.map(({ label, value }) => (
            <button
              key={label}
              type="button"
              onClick={() => adjustTime(value)}
              disabled={isRunning}
              className={clsx(
                'flex h-[52px] w-[100px] items-center justify-center rounded-[16px] text-[20px] font-semibold text-default-black transition-all duration-200 ease-in-out',
                'bg-brand/80 hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-default-neutral/50',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 우측 영역 */}
      <span className="flex w-[360px] flex-col space-y-[16px] xl:min-w-[480px]">
        {/* 타이머 */}
        <CircularTimer
          progress={progressMotionValue}
          stance={'NEUTRAL'}
          boxType={'FEEDBACK'}
          strokeWidth={getStrokeWidth()}
          className="aspect-square w-full"
        >
          <span
            className={clsx(
              'flex w-full flex-row items-center justify-center space-x-[16px] p-[16px] text-[70px] font-bold tabular-nums text-default-black xl:text-[110px]',
            )}
          >
            <p className="flex flex-1 items-center justify-center">{minute}</p>
            <p className="flex items-center justify-center">:</p>
            <p className="flex flex-1 items-center justify-center">{second}</p>
          </span>
        </CircularTimer>

        {/* 조작부 */}
        <TimerController
          isRunning={isRunning}
          onStart={startTimer}
          onPause={pauseTimer}
          onReset={resetTimer}
          stance={'NEUTRAL'}
          boxType={'FEEDBACK'}
        />
      </span>
    </div>
  );
}
