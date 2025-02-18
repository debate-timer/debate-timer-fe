import { RiSpeakFill } from 'react-icons/ri';
import {
  DebateTypeToString,
  StanceToString,
  TimeBoxInfo,
} from '../../../type/type';
import TimerController from './TimerController';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { Formatting } from '../../../util/formatting';
import AdditionalTimerController from './AdditionalTimerController';
import { IoCloseOutline } from 'react-icons/io5';

interface TimerProps {
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  addOnTimer: (delta: number) => void;
  onChangingTimer: () => void;
  goToOtherItem: (isPrev: boolean) => void;
  timer: number;
  isAdditionalTimerOn: boolean;
  isTimerChangeable: boolean;
  isRunning: boolean;
  isLastItem: boolean;
  isFirstItem: boolean;
  item: TimeBoxInfo;
}

export default function Timer({
  onStart,
  onPause,
  onReset,
  addOnTimer,
  onChangingTimer,
  goToOtherItem,
  timer,
  isAdditionalTimerOn,
  isTimerChangeable,
  isRunning,
  isLastItem,
  isFirstItem,
  item,
}: TimerProps) {
  const minute = Formatting.formatTwoDigits(Math.floor(Math.abs(timer) / 60));
  const second = Formatting.formatTwoDigits(Math.abs(timer % 60));
  const bgColorClass =
    item.stance === 'NEUTRAL' || isAdditionalTimerOn
      ? 'bg-slate-500'
      : item.stance === 'PROS'
        ? 'bg-blue-500'
        : 'bg-red-500';
  const horizontalSpaceClass = timer < 0 ? 'space-x-5' : 'space-x-10';
  const titleText = isAdditionalTimerOn
    ? DebateTypeToString['TIME_OUT']
    : item.stance === 'NEUTRAL'
      ? DebateTypeToString[item.type]
      : StanceToString[item.stance] + ' ' + DebateTypeToString[item.type];

  return (
    <div
      data-testid="timer"
      className="flex min-h-[300px] w-[810px] flex-col items-center rounded-[45px] bg-slate-200"
    >
      {/* Title of timer */}
      <div
        className={`flex h-[139px] w-full items-center justify-between rounded-t-[45px] ${bgColorClass} relative text-[75px] font-bold text-slate-50`}
      >
        {/* Title text  */}
        <h1 className="absolute left-1/2 -translate-x-1/2 transform">
          {titleText}
        </h1>

        {/* Close button, if additional timer is enabled */}
        {isAdditionalTimerOn && (
          <button
            className="ml-auto px-[30px]"
            onClick={() => onChangingTimer()}
          >
            <IoCloseOutline className="size-[40px] hover:text-slate-300" />
          </button>
        )}
      </div>

      {/* Speaker's number, if necessary */}
      <div className="my-[20px] h-[40px]">
        {item.stance !== 'NEUTRAL' && !isAdditionalTimerOn && (
          <div className="flex w-full flex-row items-center space-x-2 text-slate-900">
            <RiSpeakFill className="size-[40px]" />
            <h1 className="text-[25px] font-bold">1번 토론자</h1>
          </div>
        )}
      </div>

      {/* Timer display */}
      <div className="flex flex-row items-center space-x-[20px]">
        {/* Button that moves to previous sequence(timebox) */}
        <div className="size-[90px]">
          {!isFirstItem && (
            <button
              className="size-[90px] rounded-full bg-slate-500 p-[14px] hover:bg-slate-700"
              onClick={() => goToOtherItem(true)}
            >
              <IoIosArrowBack className="size-full" />
            </button>
          )}
        </div>

        {/* Prints remaining time  */}
        <div
          className={`flex h-[230px] w-[550px] flex-row items-center justify-center ${horizontalSpaceClass} bg-slate-50 text-[150px] font-bold text-slate-900`}
        >
          {timer < 0 && <p className="w-[70px]">-</p>}
          <p className="w-[200px]">{minute}</p>
          <p className="w-[50px]">:</p>
          <p className="w-[200px]">{second}</p>
        </div>

        {/* Button that moves to next sequence(timebox) */}
        <div className="size-[90px]">
          {!isLastItem && (
            <button
              className="size-[90px] rounded-full bg-slate-500 p-[14px] hover:bg-slate-700"
              onClick={() => goToOtherItem(false)}
            >
              <IoIosArrowForward className="size-full" />
            </button>
          )}
        </div>
      </div>

      {/* Timer controller and additional timer controller */}
      <div className="my-[30px]">
        {!isAdditionalTimerOn && (
          <TimerController
            isRunning={isRunning}
            isTimerChangeable={isTimerChangeable}
            onChangingTimer={() => onChangingTimer()}
            onStart={() => onStart()}
            onPause={() => onPause()}
            onReset={() => onReset()}
          />
        )}

        {isAdditionalTimerOn && (
          <AdditionalTimerController
            isRunning={isRunning}
            onStart={() => onStart()}
            onPause={() => onPause()}
            addOnTimer={(delta: number) => addOnTimer(delta)}
          />
        )}
      </div>
    </div>
  );
}
