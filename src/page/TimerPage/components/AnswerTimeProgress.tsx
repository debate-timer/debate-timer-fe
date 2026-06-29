import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

const ANSWER_TIME_STATUS_COLOR = {
  covered: '#4CAF51',
  warning: '#FECD4C',
  over: '#FF8B87',
} as const;

interface AnswerTimeProgressProps {
  answerTime: number;
  elapsedTime: number;
  isResetting?: boolean;
  onClick: () => void;
}

export default function AnswerTimeProgress({
  answerTime,
  elapsedTime,
  isResetting = false,
  onClick,
}: AnswerTimeProgressProps) {
  const { t } = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  const ratio = answerTime > 0 ? elapsedTime / answerTime : 0;
  const progress = Math.min(ratio * 100, 100);
  const statusColor = getAnswerTimeStatusColor(ratio);

  useEffect(() => {
    const animationFrameId = requestAnimationFrame(() => {
      setIsOpened(true);
    });

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <button
      type="button"
      className={clsx(
        'flex w-full max-w-full items-center gap-[12px] transition-all duration-[350ms] ease-out',
        isOpened && !isResetting
          ? 'translate-y-0 opacity-100'
          : 'translate-y-[4px] opacity-0',
      )}
      onClick={onClick}
    >
      <span className="flex-shrink-0 font-bold text-default-black">
        {t('답변')}
      </span>

      <div className="relative h-[12px] min-w-0 flex-1 overflow-hidden rounded-full bg-default-disabled/hover xl:h-[18px]">
        <div className="absolute inset-[1px] rounded-full bg-default-white" />
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: statusColor,
          }}
        />
      </div>

      <span className="flex-shrink-0 text-right font-bold tabular-nums leading-none text-default-black">
        {t('{{seconds}}초', { seconds: elapsedTime.toFixed(1) })}
      </span>
    </button>
  );
}

function getAnswerTimeStatusColor(ratio: number) {
  if (ratio < 0.8) return ANSWER_TIME_STATUS_COLOR.covered;
  if (ratio < 1) return ANSWER_TIME_STATUS_COLOR.warning;
  return ANSWER_TIME_STATUS_COLOR.over;
}
