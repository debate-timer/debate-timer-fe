import { TimeBoxInfo } from '../../../type/type';
import TimerController from './TimerController';
import { Formatting } from '../../../util/formatting';
import AdditionalTimerController from './AdditionalTimerController';
import { IoCloseOutline } from 'react-icons/io5';
import { MdRecordVoiceOver } from 'react-icons/md';
import { NormalTimerLogics } from '../hooks/useNormalTimer';

interface NormalTimerProps {
  normalTimerInstance: NormalTimerLogics;
  isAdditionalTimerAvailable: boolean;
  item: TimeBoxInfo;
  teamName: string | null;
}

export default function NormalTimer({
  normalTimerInstance,
  isAdditionalTimerAvailable,
  item,
  teamName,
}: NormalTimerProps) {
  const {
    timer,
    isAdditionalTimerOn,
    isRunning,
    handleChangeAdditionalTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    setTimer,
  } = normalTimerInstance;
  const totalTime = timer ?? 0;
  const minute = Formatting.formatTwoDigits(
    Math.floor(Math.abs(totalTime) / 60),
  );
  const second = Formatting.formatTwoDigits(Math.abs(totalTime % 60));
  const bgColorClass =
    item.stance === 'NEUTRAL' || isAdditionalTimerOn
      ? 'bg-neutral-500'
      : item.stance === 'PROS'
        ? 'bg-camp-blue'
        : 'bg-camp-red';
  const titleText = isAdditionalTimerOn ? '작전 시간' : item.speechType;

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
      className={`flex min-h-[300px] w-[460px] flex-col items-center rounded-[45px] bg-neutral-200 duration-100 lg:w-[600px] ${boxShadow} xl:w-[720px]`}
    >
      {/* Title of timer */}
      <div
        className={`flex h-[80px] w-full items-center justify-center rounded-t-[45px] lg:h-[105px] xl:h-[139px] ${bgColorClass} relative font-bold text-neutral-50`}
      >
        {/* Title text  
        <h1 className="absolute left-1/2 w-max -translate-x-1/2 transform">
          {titleText}
        </h1> */}
        <p className="w-full items-center text-center text-[45px] font-semibold lg:text-[60px] lg:font-bold xl:text-[75px]">
          {titleText}
        </p>

        {/* */}
        {/* Close button, if additional timer is enabled */}
        {isAdditionalTimerOn && (
          <button
            className="absolute right-10 top-1/2 -translate-y-1/2"
            onClick={handleChangeAdditionalTimer}
          >
            <IoCloseOutline className="size-[30px] hover:text-neutral-300 lg:size-[35px] xl:size-[40px]" />
          </button>
        )}
      </div>

      {/* Speaker's number, if necessary */}
      <div className="my-[12px] h-[25px] lg:my-[17px] lg:h-[30px] xl:my-[20px] xl:h-[40px]">
        <div className="flex w-full flex-row items-center justify-center space-x-2 text-neutral-900">
          {item.stance !== 'NEUTRAL' && isAdditionalTimerOn && (
            <>
              <MdRecordVoiceOver className="size-[30px] lg:size-[35px] xl:size-[40px]" />
              <h3 className="text-[18px] font-semibold lg:text-[24px] xl:text-[28px]">
                {teamName && teamName + '  팀 '}
                {item.speaker && '| ' + item.speaker + ' 토론자'}
              </h3>
            </>
          )}
        </div>
      </div>

      {/* Timer display */}
      <div
        className={`flex h-[140px] w-[400px] flex-row items-center justify-center bg-slate-50 text-center text-[90px] font-bold text-neutral-900 lg:h-[190px] lg:w-[520px] lg:text-[120px] xl:h-[230px] xl:w-[600px] xl:space-x-5 xl:text-[150px]`}
      >
        {totalTime < 0 && <p className="w-[30px] lg:w-[70px]">-</p>}
        <p className="w-[130px] lg:w-[200px]">{minute}</p>
        <p className="w-[50px] -translate-y-[7px] lg:-translate-y-[10px]">:</p>
        <p className="w-[130px] lg:w-[200px]">{second}</p>
      </div>

      {/* Timer controller and additional timer controller */}
      <div className="my-[20px] flex w-full items-center justify-center lg:my-[25px] xl:my-[30px]">
        {!isAdditionalTimerOn && (
          <TimerController
            isRunning={isRunning}
            isAdditionalTimerAvailable={isAdditionalTimerAvailable}
            onChangingTimer={handleChangeAdditionalTimer}
            onStart={startTimer}
            onPause={pauseTimer}
            onReset={resetTimer}
          />
        )}

        {isAdditionalTimerOn && (
          <AdditionalTimerController
            isRunning={isRunning}
            onStart={startTimer}
            onPause={pauseTimer}
            addOnTimer={(delta: number) => setTimer(totalTime + delta)}
          />
        )}
      </div>
    </div>
  );
}
