import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import DTExpand from '../../../components/icons/Expand';

export const ANSWER_TIME_OPTIONS = [15, 30, 45, 60] as const;

interface AnswerTimeSettingProps {
  answerTime: number;
  onChangeAnswerTime: (time: number) => void;
}

export default function AnswerTimeSetting({
  answerTime,
  onChangeAnswerTime,
}: AnswerTimeSettingProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const settingRef = useRef<HTMLDivElement>(null);

  const handleCloseSetting = useCallback(() => {
    setIsOpen(false);
  }, []);

  const isClickOutsideSetting = useCallback((target: EventTarget | null) => {
    return (
      settingRef.current !== null &&
      target instanceof Node &&
      !settingRef.current.contains(target)
    );
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isClickOutsideSetting(event.target)) {
        handleCloseSetting();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleCloseSetting, isClickOutsideSetting]);

  const handleSelectAnswerTime = (time: number) => {
    onChangeAnswerTime(time);
    handleCloseSetting();
  };

  return (
    <div
      className="relative flex h-full items-center justify-center"
      ref={settingRef}
    >
      <button
        type="button"
        className="flex h-[44px] w-[184px] items-center justify-center gap-[8px] whitespace-nowrap text-subtitle-raw font-bold leading-none text-default-black"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={t('답변시간 설정')}
      >
        <span>{t('답변시간 설정')}</span>
        <DTExpand
          className={clsx(
            'w-[12px] flex-shrink-0 transition-transform duration-200',
            {
              'rotate-180': isOpen,
            },
          )}
        />
      </button>

      <div
        className={clsx(
          'absolute right-0 top-full z-20 mt-[16px] flex h-[130px] w-[240px] origin-top flex-col border border-default-disabled/hover bg-default-white px-[22px] py-[12px] text-left shadow-[0_3px_8px_rgba(0,0,0,0.22)] transition-opacity transition-transform duration-200 ease-out',
          {
            'pointer-events-auto scale-y-100 opacity-100': isOpen,
            'pointer-events-none scale-y-95 opacity-0': !isOpen,
          },
        )}
        role="dialog"
        aria-label={t('답변시간 설정')}
      >
        <p className="text-[16px] font-bold leading-none text-default-black">
          {t('보장 시간')}
        </p>

        <div className="my-[12px] h-[2px] bg-default-disabled/hover" />

        <div className="flex items-center gap-[8px]" role="group">
          {ANSWER_TIME_OPTIONS.map((seconds) => (
            <button
              key={seconds}
              type="button"
              className={clsx(
                'flex h-[28px] w-[42px] items-center justify-center rounded-[4px] border border-default-neutral text-[12px] font-semibold leading-none transition-colors',
                {
                  'bg-brand text-default-black': seconds === answerTime,
                  'bg-default-white text-default-black': seconds !== answerTime,
                },
              )}
              onClick={() => handleSelectAnswerTime(seconds)}
              aria-pressed={seconds === answerTime}
            >
              {t('{{seconds}}초', { seconds })}
            </button>
          ))}
        </div>

        <div className="mt-[14px] flex items-center gap-[8px] text-[11px] font-semibold text-default-black">
          <StatusLegend colorClassName="bg-[#4CAF51]" label={t('보장 중')} />
          <StatusLegend colorClassName="bg-[#FECD4C]" label={t('임박')} />
          <StatusLegend colorClassName="bg-[#FF8B87]" label={t('초과')} />
        </div>
      </div>
    </div>
  );
}

interface StatusLegendProps {
  colorClassName: string;
  label: string;
}

function StatusLegend({ colorClassName, label }: StatusLegendProps) {
  return (
    <span className="flex items-center gap-[4px] whitespace-nowrap">
      <span className={clsx('size-[9px] rounded-full', colorClassName)} />
      <span>{label}</span>
    </span>
  );
}
