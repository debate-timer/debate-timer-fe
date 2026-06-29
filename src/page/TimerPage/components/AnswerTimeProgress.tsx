import { useTranslation } from 'react-i18next';

const ANSWER_TIME_STATUS_COLOR = {
  covered: '#4CAF51',
  warning: '#FECD4C',
  over: '#FF8B87',
} as const;

interface AnswerTimeProgressProps {
  answerTime: number;
  elapsedTime: number;
  onClick: () => void;
}

export default function AnswerTimeProgress({
  answerTime,
  elapsedTime,
  onClick,
}: AnswerTimeProgressProps) {
  const { t } = useTranslation();
  const ratio = answerTime > 0 ? elapsedTime / answerTime : 0;
  const progress = Math.min(ratio * 100, 100);
  const statusColor = getAnswerTimeStatusColor(ratio);

  return (
    <button
      type="button"
      className="flex w-full max-w-full translate-y-0 items-center gap-[12px] opacity-100 transition-all duration-[350ms] ease-out"
      onClick={onClick}
    >
      <span className="flex-shrink-0 font-bold text-default-black">
        {t('답변')}
      </span>

      <div
        className="h-[12px] min-w-0 flex-1 overflow-hidden rounded-full border bg-default-white xl:h-[18px]"
        style={{ borderColor: statusColor }}
      >
        <div
          className="h-full"
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
