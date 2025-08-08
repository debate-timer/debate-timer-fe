import { TimeBoxInfo } from '../../../type/type';
import TimerController from './TimerController';
import { Formatting } from '../../../util/formatting';
import CircularTimer from './CircularTimer';
import clsx from 'clsx';
import DTDebate from '../../../components/icons/Debate';
import CompactTimeoutTimer from './CompactTimeoutTimer';
import useCircularTimerAnimation from '../hooks/useCircularTimerAnimation';

type NormalTimerInstance = {
  timer: number | null;
  isAdditionalTimerOn: boolean;
  isRunning: boolean;
  handleChangeAdditionalTimer: () => void;
  handleCloseAdditionalTimer: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setTimer: (val: number) => void;
};

interface NormalTimerProps {
  normalTimerInstance: NormalTimerInstance;
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
    startTimer,
    pauseTimer,
    resetTimer,
    handleChangeAdditionalTimer,
    handleCloseAdditionalTimer,
  } = normalTimerInstance;
  const totalTime = timer ?? 0;
  const minute = Formatting.formatTwoDigits(
    Math.floor(Math.abs(totalTime) / 60),
  );
  const second = Formatting.formatTwoDigits(Math.abs(totalTime % 60));
  const titleText = item.speechType;
  const rawProgress =
    timer !== null && item.time ? ((item.time - timer) / item.time) * 100 : 0;
  const progressMotionValue = useCircularTimerAnimation(rawProgress);

  // px-[45px]
  return (
    <div className="flex flex-row space-x-[80px]">
      {/* 좌측 영역 */}
      <span className="flex min-w-[450px] flex-col items-center justify-center">
        <span className="flex w-full flex-col items-center justify-center space-y-[36px] px-[45px]">
          {/* 제목 */}
          <h1 className="text-[68px] font-bold">{titleText}</h1>

          {/* 발언자 및 팀 정보 */}
          {(teamName || item.speaker) && (
            <span className="flex w-full flex-row items-center justify-center space-x-[16px]">
              <DTDebate className="w-[28px]" />
              <p className="text-[28px]">
                {teamName && teamName + ' 팀'}
                {teamName && item.speaker && ' | '}
                {item.speaker && item.speaker + ' 토론자'}
              </p>
            </span>
          )}

          {/* 작전 시간 타이머 버튼 */}
          {isAdditionalTimerAvailable && !isAdditionalTimerOn && (
            <button
              type="button"
              onClick={handleChangeAdditionalTimer}
              className={clsx(
                'flex h-[68px] w-full items-center justify-center rounded-[20px] bg-default-white',
              )}
            >
              <span
                className={clsx(
                  'flex h-[68px] w-full items-center justify-center rounded-[20px] text-[28px] font-semibold transition-all duration-200 ease-in-out',
                  {
                    'bg-camp-blue/50 hover:bg-camp-blue':
                      item.stance === 'PROS',
                  },
                  {
                    'bg-camp-red/50 hover:bg-camp-red': item.stance === 'CONS',
                  },
                  {
                    'bg-default-neutral/50 hover:bg-default-neutral':
                      item.stance === 'NEUTRAL',
                  },
                )}
              >
                작전 시간
              </span>
            </button>
          )}
        </span>

        {isAdditionalTimerAvailable && isAdditionalTimerOn && (
          <CompactTimeoutTimer
            onClose={handleCloseAdditionalTimer}
            className="mt-[56px]"
          />
        )}
      </span>

      {/* 우측 영역 */}
      <span className="flex min-w-[480px] flex-col space-y-[16px]">
        {/* 타이머 */}
        <CircularTimer
          progress={progressMotionValue}
          stance={item.stance}
          size={480}
          strokeWidth={20}
        >
          <span
            className={clsx(
              'flex w-full flex-row items-center justify-center p-[16px] text-[110px] font-bold text-default-black',
              { 'space-x-[8px]': totalTime < 0 },
              { 'space-x-[16px]': totalTime >= 0 },
            )}
          >
            {totalTime < 0 && (
              <p className="flex items-center justify-center">-</p>
            )}
            <p className="flex flex-1 items-center justify-center">{minute}</p>
            <p className="flex items-center justify-center">:</p>
            <p className="flex flex-1 items-center justify-center">{second}</p>
          </span>
        </CircularTimer>

        {/* 조작부 */}
        <TimerController
          isRunning={isRunning}
          onStart={startTimer}
          onPause={pauseTimer}
          onReset={() => resetTimer()}
          stance={item.stance}
        />
      </span>
    </div>
  );
}
