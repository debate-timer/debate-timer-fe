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
      className="flex h-[140px] w-[620px] flex-row xl:h-[180px] xl:w-[730px]"
    >
      <div className="flex size-full flex-1 items-center justify-end ">
        <button
          className="size-[70px] rounded-full bg-neutral-900 p-[18px] hover:bg-brand-main xl:size-[82px]"
          onClick={() => onReset()}
        >
          <FiRefreshCcw className="size-full justify-center text-slate-50" />
        </button>
      </div>
      <div className="flex size-full flex-1 items-center justify-center ">
        <button
          className="size-[130px] rounded-full bg-neutral-900 p-[40px] hover:bg-brand-main xl:size-[152px] xl:p-[45px]"
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
        {isTimerChangeable && (
          <button
            data-testid="additional-timer-button"
            className="h-[120px] w-[150px] flex-col items-center space-y-1 rounded-[23px] border-[3px] border-neutral-900 bg-neutral-50 text-[27px] font-bold leading-[37px] hover:bg-neutral-200 xl:h-[133px] xl:w-[165px] xl:space-y-2 xl:text-[30px]"
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
