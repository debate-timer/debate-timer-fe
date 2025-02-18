import { RiSpeakFill } from 'react-icons/ri';
import {
  DebateTypeToString,
  StanceToString,
  TimeBoxInfo,
} from '../../../type/type';
import TimerController from './TimerController';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { Formatting } from '../../../util/formatting';

interface TimerProps {
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onChangeTimer: () => void;
  goToOtherItem: (isPrev: boolean) => void;
  timer: number;
  isTimerChangeable: boolean;
  isRunning: boolean;
  item: TimeBoxInfo;
}

export default function Timer({
  onStart,
  onPause,
  onReset,
  onChangeTimer,
  goToOtherItem,
  timer,
  isTimerChangeable,
  isRunning,
  item,
}: TimerProps) {
  const minute = Formatting.formatTwoDigits(Math.floor(Math.abs(timer) / 60));
  const second = Formatting.formatTwoDigits(Math.abs(timer % 60));
  const stanceText =
    item.stance === 'NEUTRAL' ? '' : StanceToString[item.stance] + ' ';
  const bgColorClass =
    item.stance === 'NEUTRAL'
      ? 'bg-slate-500'
      : item.stance === 'PROS'
        ? 'bg-blue-500'
        : 'bg-red-500';
  const horizontalSpaceClass = timer < 0 ? 'space-x-5' : 'space-x-10';

  return (
    <div className="flex min-h-[300px] w-[810px] flex-col items-center rounded-[45px] bg-slate-200">
      <div
        className={`flex h-[139px] w-full items-center justify-center rounded-t-[45px] ${bgColorClass} text-[75px] font-bold text-slate-50`}
      >
        <h1>
          {stanceText}
          {DebateTypeToString[item.type]}
        </h1>
      </div>

      <div className="my-[20px] h-[40px]">
        {item.stance !== 'NEUTRAL' && (
          <div className="flex w-full flex-row items-center space-x-2 text-slate-500">
            <RiSpeakFill className="size-[40px]" />
            <h1 className="text-[25px] font-bold">1번 토론자</h1>
          </div>
        )}
      </div>

      <div className="flex flex-row items-center space-x-[20px]">
        <button
          className="size-[90px] rounded-full bg-slate-500 p-[14px] hover:bg-slate-700"
          onClick={() => goToOtherItem(true)}
        >
          <IoIosArrowBack className="size-full" />
        </button>

        <div
          className={`flex h-[230px] w-[550px] flex-row items-center justify-center ${horizontalSpaceClass} bg-slate-50 text-[150px] font-bold text-slate-900`}
        >
          {timer < 0 && <p>-</p>}
          <p>{minute}</p>
          <p>:</p>
          <p>{second}</p>
        </div>

        <button
          className="size-[90px] rounded-full bg-slate-500 p-[14px] hover:bg-slate-700"
          onClick={() => goToOtherItem(false)}
        >
          <IoIosArrowForward className="size-full" />
        </button>
      </div>

      <div className="my-[30px]">
        <TimerController
          isRunning={isRunning}
          isTimerChangeable={isTimerChangeable}
          onChangeTimer={() => onChangeTimer()}
          onStart={() => onStart()}
          onPause={() => onPause()}
          onReset={() => onReset()}
        />
      </div>
    </div>
  );
}
