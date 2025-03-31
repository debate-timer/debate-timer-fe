import { FaPlay } from 'react-icons/fa';
import { FiRefreshCcw } from 'react-icons/fi';
import { GiPauseButton } from 'react-icons/gi';

interface TimerControllerProps {
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onChangingTimer: () => void;
  isTimerChangeable: boolean;
  isRunning: boolean;
}

export default function TimerController({
  onStart,
  onPause,
  onReset,
  onChangingTimer,
  isTimerChangeable,
  isRunning,
}: TimerControllerProps) {
  return (
    <div
      data-testid="timer-controller"
      className="flex h-[180px] w-[730px] flex-row"
    >
      <div className="flex size-full flex-1 items-center justify-end ">
        <button
          className="size-[82px] rounded-full bg-neutral-900 p-[18px] hover:bg-brand-main"
          onClick={() => onReset()}
        >
          <FiRefreshCcw className="size-full justify-center text-slate-50" />
        </button>
      </div>
      <div className="flex size-full flex-1 items-center justify-center ">
        {' '}
        <button
          className="size-[152px] rounded-full bg-neutral-900 p-[45px] hover:bg-brand-main"
          onClick={() => {
            if (isRunning) {
              onPause();
            } else {
              onStart();
            }
          }}
        >
          {isRunning && (
            <GiPauseButton className="size-full justify-center text-neutral-50" />
          )}
          {!isRunning && (
            <FaPlay className="size-full justify-center text-neutral-50" />
          )}
        </button>
      </div>
      <div className="flex size-full flex-1 items-center justify-start ">
        {' '}
        {isTimerChangeable && (
          <button
            data-testid="additional-timer-button"
            className="h-[133px] w-[165px] flex-col items-center space-y-2 rounded-[23px] border-[3px] border-neutral-900 bg-neutral-50 text-[30px] font-bold leading-[37px] hover:bg-neutral-200"
            onClick={() => onChangingTimer()}
          >
            <p>작전 시간</p>
            <p>사용</p>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div
      data-testid="timer-controller"
      className="relative h-[180px] w-[730px]"
    >
      {/* Left-sided element */}
      <div className="absolute right-1/2 top-1/2 mr-[72px] -translate-x-1/2 -translate-y-1/2 transform">
        <button
          className="size-[82px] rounded-full bg-neutral-900 p-[18px] hover:bg-brand-main"
          onClick={() => onReset()}
        >
          <FiRefreshCcw className="size-full justify-center text-slate-50" />
        </button>
      </div>

      {/* Center-sided element */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
        <button
          className="size-[152px] rounded-full bg-neutral-900 p-[45px] hover:bg-brand-main"
          onClick={() => {
            if (isRunning) {
              onPause();
            } else {
              onStart();
            }
          }}
        >
          {isRunning && (
            <GiPauseButton className="size-full justify-center text-neutral-50" />
          )}
          {!isRunning && (
            <FaPlay className="size-full justify-center text-neutral-50" />
          )}
        </button>
      </div>

      {/* Right-sided element */}
      <div className="absolute left-1/2 top-1/2 ml-[192px] -translate-x-1/2 -translate-y-1/2 transform">
        {isTimerChangeable && (
          <button
            data-testid="additional-timer-button"
            className="h-[133px] w-[165px] flex-col items-center space-y-2 rounded-[23px] border-[3px] border-neutral-900 bg-neutral-50 text-[30px] font-bold leading-[37px] hover:bg-neutral-200"
            onClick={() => onChangingTimer()}
          >
            <p>작전 시간</p>
            <p>사용</p>
          </button>
        )}
      </div>
    </div>
  );
}
