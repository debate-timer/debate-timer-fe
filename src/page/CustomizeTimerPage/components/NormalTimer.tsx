import {
  CustomizeTimeBoxInfo,
  ParliamentarySpeechTypeToString,
} from '../../../type/type';
import TimerController from './TimerController';
import { Formatting } from '../../../util/formatting';
import AdditionalTimerController from './AdditionalTimerController';
import { IoCloseOutline } from 'react-icons/io5';
import { MdRecordVoiceOver } from 'react-icons/md';

interface NormalTimerProps {
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
  item: CustomizeTimeBoxInfo;
  teamName: string | null;
}

export default function NormalTimer({
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
  teamName,
}: NormalTimerProps) {
  const minute = Formatting.formatTwoDigits(Math.floor(Math.abs(timer) / 60));
  const second = Formatting.formatTwoDigits(Math.abs(timer % 60));
  const bgColorClass =
    item.stance === 'NEUTRAL' || isAdditionalTimerOn
      ? 'bg-neutral-500'
      : item.stance === 'PROS'
        ? 'bg-camp-blue'
        : 'bg-camp-red';
  const titleText = isAdditionalTimerOn
    ? ParliamentarySpeechTypeToString['TIME_OUT']
    : item.speechType;

  const boxShadow = isRunning
    ? item.stance === 'NEUTRAL'
      ? 'shadow-camp-neutral'
      : item.stance === 'PROS'
        ? 'shadow-camp-blue'
        : 'shadow-camp-red'
    : '';

  return (
    <div
      data-testid="timer"
      className={`flex w-[600px] flex-col items-center rounded-[45px] bg-neutral-200 duration-100 ${boxShadow} xl:w-[720px]`}
    >
      {/* Title of timer */}
      <div
        className={`flex h-[105px] w-full items-center justify-center rounded-t-[45px] xl:h-[139px] ${bgColorClass} relative font-bold text-neutral-50`}
      >
        {/* Title text  
        <h1 className="absolute left-1/2 w-max -translate-x-1/2 transform">
          {titleText}
        </h1> */}
        <p className="w-full items-center text-center text-[60px] font-bold xl:text-[75px]">
          {titleText}
        </p>

        {/* */}
        {/* Close button, if additional timer is enabled */}
        {isAdditionalTimerOn && (
          <button
            className="absolute right-10 top-1/2 -translate-y-1/2"
            onClick={() => onChangingTimer()}
          >
            <IoCloseOutline className="size-[35px] hover:text-neutral-300 xl:size-[40px]" />
          </button>
        )}
      </div>

      {/* Speaker's number, if necessary */}
      <div className="my-[17px] h-[30px] xl:my-[20px] xl:h-[40px]">
        <div className="flex w-full flex-row items-center justify-center space-x-2 text-neutral-900">
          {item.stance !== 'NEUTRAL' && !isAdditionalTimerOn && (
            <>
              <MdRecordVoiceOver className="size-[35px] xl:size-[40px]" />
              <h3 className="text-[24px] font-bold xl:text-[28px]">
                {teamName && teamName + '  팀 '}
                {item.speaker && '| ' + item.speaker + ' 토론자'}
              </h3>
            </>
          )}
        </div>
      </div>

      {/* Timer display */}
      <div
        className={`flex h-[190px] w-[520px] items-center justify-center bg-white text-[110px] font-bold text-neutral-900 shadow-inner xl:h-[220px] xl:w-[600px] xl:text-[120px]`}
      >
        {timer < 0 && '-'}
        {minute} : {second}
      </div>

      {/* Timer controller and additional timer controller */}
      <div className="my-[25px] flex w-full items-center justify-center xl:my-[30px]">
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
