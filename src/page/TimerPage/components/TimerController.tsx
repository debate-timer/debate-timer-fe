import { FaPlay, FaStop } from 'react-icons/fa';
import { FiRefreshCcw } from 'react-icons/fi';

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
      className="flex w-max flex-row items-center space-x-[35px]"
    >
      <button
        className="size-[82px] rounded-full bg-slate-900 p-[18px] hover:bg-[#000000]"
        onClick={() => onReset()}
      >
        <FiRefreshCcw className="size-full justify-center text-slate-50" />
      </button>

      {isRunning && (
        <button
          className="size-[152px] rounded-full bg-slate-900 p-[45px] hover:bg-[#000000]"
          onClick={() => onPause()}
        >
          <FaStop className="size-full justify-center text-slate-50" />
        </button>
      )}
      {!isRunning && (
        <button
          className="size-[152px] rounded-full bg-slate-900 p-[45px] hover:bg-[#000000]"
          onClick={() => onStart()}
        >
          <FaPlay className="size-full justify-center text-slate-50" />
        </button>
      )}

      {isTimerChangeable && (
        <button
          data-testid="additional-timer-button"
          className="h-[133px] w-[165px] flex-col items-center space-y-2 rounded-[23px] border-[3px] border-slate-900 bg-slate-50 text-[30px] font-bold leading-[37px] hover:bg-slate-200"
          onClick={() => onChangingTimer()}
        >
          <p>작전 시간</p>
          <p>사용</p>
        </button>
      )}
    </div>
  );
}
