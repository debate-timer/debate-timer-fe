import { GiPauseButton } from 'react-icons/gi';
import DTReset from '../../../components/icons/Reset';
import DTPlay from '../../../components/icons/Play';
import { Stance } from '../../../type/type';
import clsx from 'clsx';

interface TimerControllerProps {
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  isRunning: boolean;
  stance: Stance;
}

export default function TimerController({
  onStart,
  onPause,
  onReset,
  isRunning,
  stance,
}: TimerControllerProps) {
  return (
    <div className="flex flex-row items-center justify-center space-x-[16px] xl:space-x-[24px]">
      {/* 초기화 버튼 */}
      <button
        className="items-cent flex size-[76px] justify-center rounded-full bg-default-black2 p-[20px] xl:size-[92px]"
        onClick={onReset}
      >
        <DTReset className="size-full text-default-white" />
      </button>

      {/* 재생 및 일시정지 버튼 */}
      <button
        className={clsx(
          'flex size-[76px] items-center justify-center rounded-full p-[20px] xl:size-[92px]',
          { 'bg-camp-blue': stance === 'PROS' },
          { 'bg-camp-red': stance === 'CONS' },
          { 'bg-default-neutral': stance === 'NEUTRAL' },
          { 'bg-brand': stance === 'FEEDBACK' },
        )}
        onClick={() => {
          if (isRunning) {
            onPause();
          } else {
            onStart();
          }
        }}
      >
        {isRunning && (
          <GiPauseButton className="size-full text-default-white" />
        )}
        {!isRunning && (
          <DTPlay className="size-full translate-x-[4px] text-default-white" />
        )}
      </button>
    </div>
  );
}
