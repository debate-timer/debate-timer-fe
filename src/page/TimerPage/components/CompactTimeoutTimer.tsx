import clsx from 'clsx';
import DTClose from '../../../components/icons/Close';
import { useNormalTimer } from '../hooks/useNormalTimer';
import { Formatting } from '../../../util/formatting';
import { GiPauseButton } from 'react-icons/gi';
import DTPlay from '../../../components/icons/Play';
import { useEffect, useState } from 'react';

function CompactTimeoutTimerButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        'flex h-[40px] w-[72px] items-center justify-center rounded-[10px] bg-default-neutral text-[20px] font-semibold text-default-black',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

interface CompactTimeoutTimerProps {
  onClose: () => void;
  className: string;
}

export default function CompactTimeoutTimer({
  onClose,
  className,
}: CompactTimeoutTimerProps) {
  const state = useNormalTimer();
  const minute = Formatting.formatTwoDigits(
    Math.floor(Math.abs(state.timer ?? 0) / 60),
  );
  const second = Formatting.formatTwoDigits(Math.abs((state.timer ?? 0) % 60));

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (state.timer !== null && state.isRunning && state.timer <= 0) {
      state.pauseTimer();
      onClose();
    }
  });

  return (
    <div
      className={clsx(
        'flex w-full flex-col items-center justify-center rounded-[10px] bg-default-neutral/50 p-[20px]',
        'transition-all duration-700 ease-out',
        {
          'opacity-0 translate-y-8': !isMounted, // 초기 상태: 숨겨지고 아래로 내려감 (32px)
          'opacity-100 translate-y-0': isMounted, // 최종 상태: 나타나고 원래 위치로
        },
        className,
      )}
    >
      <span className="relative flex w-full items-center justify-center">
        <h1 className="text-[36px] font-bold">작전 시간</h1>
        <button className="absolute end-[20px]" onClick={onClose}>
          <DTClose className="size-[24px]" />
        </button>
      </span>

      <span className="my-[8px] flex w-full items-center justify-center text-[70px] font-bold">
        <p className="w-[120px] text-center">{minute}</p>
        <p className="text-center">:</p>
        <p className="w-[120px] text-center">{second}</p>
      </span>

      <span className="flex w-full flex-row items-center justify-center space-x-[10px]">
        <CompactTimeoutTimerButton
          onClick={() => {
            if (state.timer !== null && state.timer >= 60) {
              state.setTimer(state.timer - 60);
            }
          }}
        >
          -1분
        </CompactTimeoutTimerButton>
        <CompactTimeoutTimerButton
          onClick={() => {
            if (state.timer !== null && state.timer >= 30) {
              state.setTimer(state.timer - 30);
            }
          }}
        >
          -30초
        </CompactTimeoutTimerButton>

        {/* 재생 및 일시정지 버튼 */}
        <button
          className="flex size-[72px] items-center justify-center rounded-full bg-default-black p-[20px]"
          onClick={() => {
            if (!state.isRunning && state.timer !== null && state.timer > 0) {
              state.startTimer();
            } else {
              state.pauseTimer();
            }
          }}
        >
          {state.isRunning && (
            <GiPauseButton className="size-full text-default-white" />
          )}
          {!state.isRunning && (
            <DTPlay className="size-full translate-x-[4px] text-default-white" />
          )}
        </button>

        <CompactTimeoutTimerButton
          onClick={() => state.setTimer((state.timer ?? 0) + 30)}
        >
          +30초
        </CompactTimeoutTimerButton>
        <CompactTimeoutTimerButton
          onClick={() => state.setTimer((state.timer ?? 0) + 60)}
        >
          +1분
        </CompactTimeoutTimerButton>
      </span>
    </div>
  );
}
