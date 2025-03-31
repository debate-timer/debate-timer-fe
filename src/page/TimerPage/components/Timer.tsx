import { RiSpeakFill } from 'react-icons/ri';
import {
  ParliamentarySpeechTypeToString,
  StanceToString,
  ParliamentaryTimeBoxInfo,
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
  item: ParliamentaryTimeBoxInfo;
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
  const speakerText =
    item.stance !== 'NEUTRAL'
      ? item.speakerNumber
        ? StanceToString[item.stance] +
          ' 팀 | ' +
          item.speakerNumber +
          '번 토론자'
        : StanceToString[item.stance] + ' 팀'
      : '';
  const titleText = isAdditionalTimerOn
    ? ParliamentarySpeechTypeToString['TIME_OUT']
    : item.stance === 'NEUTRAL'
      ? ParliamentarySpeechTypeToString[item.type]
      : ParliamentarySpeechTypeToString[item.type];
  const neonClass = isRunning
    ? item.stance === 'NEUTRAL'
      ? 'animate-neon-blink-neutral'
      : item.stance === 'PROS'
        ? 'animate-neon-blink-pros'
        : 'animate-neon-blink-cons'
    : '';

  return (
    <div
      data-testid="timer"
      className={`flex w-[736px] ${neonClass} flex-col items-center rounded-[45px] bg-neutral-200`}
    >
      {/* Title of timer */}
      <div
        className={`flex h-[139px] w-full rounded-t-[45px] ${bgColorClass} relative py-4 text-neutral-50`}
      >
        {/* Title text <p className="absolute left-1/2 w-max -translate-x-1/2 transform"> */}
        <p className="w-full items-center text-center text-[75px] font-bold">
          {titleText}
        </p>

        {/* Close button, if additional timer is enabled */}
        {isAdditionalTimerOn && (
          <button
            className="absolute right-10 top-1/2 -translate-y-1/2"
            onClick={() => onChangingTimer()}
          >
            <IoCloseOutline className="size-[40px] hover:text-neutral-300" />
          </button>
        )}
      </div>

      {/* Speaker's number, if necessary */}
      <div className="my-[20px] h-[40px]">
        {item.stance !== 'NEUTRAL' && !isAdditionalTimerOn && (
          <div className="flex w-full flex-row items-center space-x-2 text-neutral-900">
            <RiSpeakFill className="size-[40px]" />
            <p className="text-[28px] font-bold">{speakerText}</p>
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
      <div className="my-[30px] flex w-full items-center justify-center">
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
