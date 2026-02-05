import { useTranslation } from 'react-i18next';
import { GiPauseButton } from 'react-icons/gi';
import DTReset from '../../../components/icons/Reset';
import DTPlay from '../../../components/icons/Play';
import { Stance, TimeBoxType } from '../../../type/type';
import clsx from 'clsx';

interface TimerControllerProps {
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  isRunning: boolean;
  stance: Stance;
  boxType?: TimeBoxType;
}

export default function TimerController({
  onStart,
  onPause,
  onReset,
  isRunning,
  stance,
  boxType,
}: TimerControllerProps) {
  const { t } = useTranslation();
  const bgClass =
    boxType === 'FEEDBACK'
      ? 'bg-brand'
      : stance === 'PROS'
        ? 'bg-camp-blue'
        : stance === 'CONS'
          ? 'bg-camp-red'
          : 'bg-default-neutral';
  return (
    <div className="flex flex-row items-center justify-center space-x-[16px] xl:space-x-[24px]">
      {/* 초기화 버튼 */}
      <button
        type="button"
        aria-label={t('타이머 초기화')}
        className={clsx(
          'flex size-[76px] items-center justify-center rounded-full bg-default-black2 p-[20px] xl:size-[92px]',
          { 'hover:bg-[#676767]': boxType === 'FEEDBACK' },
        )}
        onClick={onReset}
      >
        <DTReset className="size-full text-default-white" />
      </button>

      {/* 재생 및 일시정지 버튼 */}
      <button
        type="button"
        aria-label={isRunning ? t('일시정지') : t('재생')}
        aria-pressed={isRunning}
        className={clsx(
          'flex size-[76px] items-center justify-center rounded-full p-[20px] xl:size-[92px]',
          bgClass,
          { 'hover:bg-brand-hover': boxType === 'FEEDBACK' },
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
