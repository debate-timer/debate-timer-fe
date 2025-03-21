import { RiSpeakFill } from 'react-icons/ri';
import {
  DebateTypeToString,
  StanceToString,
  TimeBoxInfo,
} from '../../../type/type';
import TimerController from './TimerController';
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
  timer,
  isAdditionalTimerOn,
  isTimerChangeable,
  isRunning,
  item,
}: TimerProps) {
  const minute = Formatting.formatTwoDigits(Math.floor(Math.abs(timer) / 60));
  const second = Formatting.formatTwoDigits(Math.abs(timer % 60));
  const bgColorClass =
    item.stance === 'NEUTRAL' || isAdditionalTimerOn
      ? 'bg-neutral-500'
      : item.stance === 'PROS'
        ? 'bg-camp-blue'
        : 'bg-camp-red';
  const titleText = isAdditionalTimerOn
    ? DebateTypeToString['TIME_OUT']
    : item.stance === 'NEUTRAL'
      ? DebateTypeToString[item.type]
      : StanceToString[item.stance] + ' ' + DebateTypeToString[item.type];

  return (
    <div
      data-testid="timer"
      className="flex min-h-[300px] w-[736px] flex-col items-center rounded-[45px] bg-neutral-200"
    >
      {/* Title of timer */}
      <div
        className={`flex h-[139px] w-full items-center justify-between rounded-t-[45px] ${bgColorClass} relative text-[75px] font-bold text-neutral-50`}
      >
        {/* Title text  */}
        <h1 className="absolute left-1/2 w-max -translate-x-1/2 transform">
          {titleText}
        </h1>

        {/* Close button, if additional timer is enabled */}
        {isAdditionalTimerOn && (
          <button
            className="ml-auto px-[30px]"
            onClick={() => onChangingTimer()}
          >
            <IoCloseOutline className="size-[40px] hover:text-neutral-300" />
          </button>
        )}
      </div>

      {/* Speaker's number, if necessary */}
      <div className="my-[20px] h-[40px]">
        {item.stance !== 'NEUTRAL' &&
          !isAdditionalTimerOn &&
          item.speakerNumber && (
            <div className="flex w-full flex-row items-center space-x-2 text-neutral-900">
              <RiSpeakFill className="size-[40px]" />
              <h1 className="text-[28px] font-bold">
                {item.speakerNumber}번 토론자
              </h1>
            </div>
          )}
      </div>

      {/* Timer display */}
      <div className="flex flex-row items-center space-x-[20px]">
        {/* Prints remaining time  */}
        <div
          className={`flex h-[230px] w-[600px] flex-row items-center justify-center space-x-5 bg-slate-50 text-center text-[150px] font-bold text-neutral-900`}
        >
          {timer < 0 && <p className="w-[70px]">-</p>}
          <p className="w-[200px]">{minute}</p>
          <p className="w-[50px]">:</p>
          <p className="w-[200px]">{second}</p>
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
