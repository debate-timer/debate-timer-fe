import { RiSpeakFill } from 'react-icons/ri';
import { CustomizeTimeBoxInfo } from '../../../type/type';
import TimerController from './TimerController';
import { Formatting } from '../../../util/formatting';

interface TimerProps {
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  addOnTimer: (delta: number) => void;
  onChangingTimer: () => void;
  goToOtherItem: (isPrev: boolean) => void;
  timer: number;
  isTimerChangeable: boolean;
  isRunning: boolean;
  isLastItem: boolean;
  isFirstItem: boolean;
  item: CustomizeTimeBoxInfo;

  /** 🚩 추가된 Props */
  speakingTimer: number | null; // 발언시간용 타이머 추가
  isSelected: boolean;
  onActivate?: () => void;
  prosCons: 'pros' | 'cons';
  teamName: string;
}

export default function Timer({
  onStart,
  onPause,
  onReset,
  onChangingTimer,
  timer,
  speakingTimer,
  isRunning,
  item,
  isSelected,
  onActivate,
  prosCons,
  teamName,
}: TimerProps) {
  const minute = Formatting.formatTwoDigits(
    Math.floor(Math.abs(timer ?? 0) / 60),
  );
  const second = Formatting.formatTwoDigits(Math.abs((timer ?? 0) % 60));

  /** 🚩 추가된 코드: 발언시간 표시 처리 */
  const speakingMinute = Formatting.formatTwoDigits(
    Math.floor(Math.abs((speakingTimer ?? 0) / 60)),
  );
  const speakingSecond = Formatting.formatTwoDigits(
    Math.abs((speakingTimer ?? 0) % 60),
  );

  const bgColorClass = prosCons === 'pros' ? 'bg-camp-blue' : 'bg-camp-red';

  const titleText = item.speechType;

  return (
    <div onClick={onActivate}>
      <div
        data-testid="timer"
        className={`flex min-h-[300px] w-[720px] flex-col items-center rounded-[45px] bg-neutral-200 transition-all duration-300 ${
          isSelected ? '' : 'pointer-events-none opacity-50 grayscale'
        }`}
      >
        {/* Timer Header */}
        <div
          className={`flex h-[139px] w-full items-center justify-between rounded-t-[45px] ${bgColorClass} relative text-[75px] font-bold text-neutral-50`}
        >
          <h1 className="absolute left-1/2 w-max -translate-x-1/2 transform">
            {titleText}
          </h1>
        </div>

        {/* Team name */}
        <div className="my-[20px] h-[40px]">
          {item.stance !== 'NEUTRAL' && (
            <div className="flex w-full flex-row items-center space-x-2 text-neutral-900">
              <RiSpeakFill className="size-[40px]" />
              <h1 className="text-[28px] font-bold">{teamName}</h1>
            </div>
          )}
        </div>

        {/* 🚩 Timer 영역 */}
        <div className="flex flex-col items-center space-y-[20px]">
          {speakingTimer !== null ? (
            <>
              {/* 전체시간 타이머 (상단 작게 표시) */}
              <div
                className={`relative flex h-[80px] w-[600px] items-center justify-center text-[80px] font-bold text-neutral-900`}
              >
                <div className="absolute left-3 top-2 text-sm font-semibold">
                  전체시간
                </div>
                {minute} : {second}
              </div>

              {/* 현재시간 타이머 (크게 표시) */}
              <div
                className={`relative flex h-[120px] w-[600px] items-center justify-center bg-white text-[100px] font-bold text-neutral-900 shadow-inner`}
              >
                <div className="absolute left-3 top-2 text-sm font-semibold">
                  현재시간
                </div>
                {speakingMinute} : {speakingSecond}
              </div>
            </>
          ) : (
            <>
              {/* 타이머가 하나일 때 (크게 표시) */}
              <div
                className={`flex h-[220px] w-[600px] items-center justify-center bg-white text-[120px] font-bold text-neutral-900 shadow-inner`}
              >
                {minute} : {second}
              </div>
            </>
          )}
        </div>

        {/* Timer controller 유지 */}
        <div className="my-[30px]">
          <TimerController
            isRunning={isRunning}
            isTimerChangeable={false}
            onChangingTimer={onChangingTimer}
            onStart={onStart}
            onPause={onPause}
            onReset={onReset}
          />
        </div>
      </div>
    </div>
  );
}
