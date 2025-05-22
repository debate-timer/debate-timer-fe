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
      className="lex-row flex h-[120px] w-[480px] lg:h-[140px] lg:w-[620px] xl:h-[180px] xl:w-[730px]"
    >
      <div className="flex size-full flex-1 items-center justify-end ">
        <button
          className="size-[60px] rounded-full bg-neutral-900 p-[15px] hover:bg-brand-main lg:size-[70px] lg:p-[18px] xl:size-[82px]"
          onClick={() => onReset()}
        >
          <FiRefreshCcw className="size-full justify-center text-slate-50" />
        </button>
      </div>
      <div className="flex size-full flex-1 items-center justify-center ">
        <button
          className="size-[100px] rounded-full bg-neutral-900 p-[30px] hover:bg-brand-main lg:size-[130px] lg:p-[40px] xl:size-[152px] xl:p-[45px]"
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
            className="h-[90px] w-[110px] flex-col items-center space-y-1 rounded-[18px] border-[3px] border-neutral-900 bg-neutral-50 text-[20px] font-bold leading-[27px] hover:bg-neutral-200 lg:h-[120px] lg:w-[150px] lg:rounded-[23px] lg:text-[27px] lg:leading-[37px] xl:h-[133px] xl:w-[165px] xl:space-y-2 xl:text-[30px]"
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
