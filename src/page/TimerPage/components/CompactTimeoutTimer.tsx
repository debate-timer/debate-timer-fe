import clsx from 'clsx';
import DTClose from '../../../components/icons/Close';
import { useNormalTimer } from '../hooks/useNormalTimer';
import { Formatting } from '../../../util/formatting';

function CompactTimeoutTimerButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        'flex h-[40px] w-[80px] items-center justify-center rounded-[10px] bg-default-neutral text-[20px] font-semibold text-default-black',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export default function CompactTimeoutTimer() {
  const state = useNormalTimer();
  const minute = Formatting.formatTwoDigits(
    Math.floor(Math.abs(state.timer ?? 0) / 60),
  );
  const second = Formatting.formatTwoDigits(Math.abs((state.timer ?? 0) % 60));

  return (
    <div className="flex w-[430px] flex-col items-center justify-center rounded-[10px] bg-default-neutral/50 p-[20px]">
      <span className="relative flex w-full items-center justify-center">
        <h1 className="text-[36px] font-bold">작전 시간</h1>
        <button className="absolute end-[20px]">
          <DTClose className="size-[24px]" />
        </button>
      </span>

      <span className="my-[8px] flex items-center justify-center text-[70px] font-bold">
        <p className="flex flex-1 items-center justify-center">{minute}</p>
        <p className="flex items-center justify-center px-[16px]">:</p>
        <p className="flex flex-1 items-center justify-center">{second}</p>
      </span>

      <span className="flex w-full flex-row items-center justify-between">
        <CompactTimeoutTimerButton>-1분</CompactTimeoutTimerButton>
        <CompactTimeoutTimerButton>-30초</CompactTimeoutTimerButton>
        <CompactTimeoutTimerButton>+30초</CompactTimeoutTimerButton>
        <CompactTimeoutTimerButton>+1분</CompactTimeoutTimerButton>
      </span>
    </div>
  );
}
