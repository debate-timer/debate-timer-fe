import { CustomizeTimeBoxInfo } from '../../../type/type';
import TimerController from './TimerController';
import { Formatting } from '../../../util/formatting';
import KeyboardKeyA from '../../../assets/img/keyboard_key_A.png';
import KeyboardKeyL from '../../../assets/img/keyboard_key_l.png';

interface TimeBasedTimerProps {
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

export default function TimeBasedTimer({
  onStart,
  onPause,
  onReset,
  onChangingTimer,
  timer,
  speakingTimer,
  isRunning,
  isSelected,
  onActivate,
  prosCons,
  teamName,
}: TimeBasedTimerProps) {
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

  const boxShadow = isRunning
    ? prosCons === 'pros'
      ? 'shadow-camp-blue'
      : 'shadow-camp-red'
    : '';

  const bgColorClass = prosCons === 'pros' ? 'bg-camp-blue' : 'bg-camp-red';

  return (
    <div
      onClick={onActivate}
      className={`rounded-[45px] duration-100 ${boxShadow}`}
    >
      <div
        data-testid="timer"
        className={`flex min-h-[300px] w-[460px] flex-col items-center rounded-[45px] bg-neutral-200 transition-all duration-300 lg:w-[600px] xl:w-[720px] ${
          isSelected ? '' : 'pointer-events-none opacity-50 grayscale'
        }`}
      >
        {/* Timer Header */}
        <div
          className={`flex h-[80px] w-full items-center justify-between rounded-t-[45px] lg:h-[105px] xl:h-[139px] ${bgColorClass} relative text-[45px] font-semibold  text-neutral-50 lg:text-[60px] lg:font-bold xl:text-[75px]`}
        >
          <h2 className="absolute left-1/2 flex w-max -translate-x-1/2 transform items-center justify-center gap-2">
            {teamName}
            <img
              src={prosCons === 'pros' ? KeyboardKeyA : KeyboardKeyL}
              alt={prosCons === 'pros' ? 'A키' : 'ㅣ키'}
              className="h-[35px] w-[35px] lg:h-[50px] lg:w-[50px] xl:h-[56px] xl:w-[56px]"
            />
          </h2>
        </div>
        {speakingTimer !== null ? (
          <div className="h-7 lg:h-10" />
        ) : (
          <div className="h-12 lg:h-14 xl:h-20" />
        )}
        {/* 🚩 Timer 영역 */}
        <div className="flex flex-col items-center space-y-[10px] lg:space-y-[15px] xl:space-y-[20px]">
          {speakingTimer !== null ? (
            <>
              {/* 전체시간 타이머 (상단 작게 표시) */}
              <div
                className={`relative flex h-[60px] w-[400px] items-center justify-center  text-[58px] font-semibold text-neutral-900 lg:h-[70px] lg:w-[520px] lg:text-[68px] lg:font-bold xl:h-[80px] xl:w-[600px] xl:text-[80px]`}
              >
                <div className="absolute left-3 top-2 text-xs font-normal lg:text-sm lg:font-semibold">
                  전체 시간
                </div>
                {minute} : {second}
              </div>

              {/* 현재시간 타이머 (크게 표시) */}
              <div
                className={`relative flex h-[110px] w-[400px] items-center justify-center bg-white text-[75px] font-semibold lg:h-[130px] lg:w-[520px] lg:text-[90px] lg:font-bold xl:h-[160px] xl:w-[600px] xl:text-[100px]`}
              >
                <div className="absolute left-3 top-2 text-xs font-normal lg:text-sm lg:font-semibold">
                  현재 시간
                </div>
                {speakingMinute} : {speakingSecond}
              </div>
            </>
          ) : (
            <>
              {/* 타이머가 하나일 때 (크게 표시) */}
              <div
                className={`flex h-[160px] w-[400px] items-center justify-center bg-white text-[75px] font-semibold text-neutral-900 shadow-inner lg:h-[200px] lg:w-[520px] lg:text-[100px] lg:font-bold xl:h-[220px] xl:w-[600px] xl:text-[120px]`}
              >
                {minute} : {second}
              </div>
            </>
          )}
        </div>

        {/* Timer controller 유지 */}
        <div className="my-[15px] lg:my-[25px] xl:my-[30px]">
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
