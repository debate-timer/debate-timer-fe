import { useTranslation } from 'react-i18next';
import { AnswerTimerOwner, AnswerTimerState } from '../hooks/useAnswerTimer';
import AnswerTimeProgress from './AnswerTimeProgress';

interface AnswerTimeTimerProps {
  owner: AnswerTimerOwner;
  answerTime: number;
  answerTimerState: AnswerTimerState | null;
  isMainTimerRunning: boolean;
  onClick: (owner: AnswerTimerOwner, isMainTimerRunning: boolean) => void;
}

export default function AnswerTimeTimer({
  owner,
  answerTime,
  answerTimerState,
  isMainTimerRunning,
  onClick,
}: AnswerTimeTimerProps) {
  const { t } = useTranslation();

  return (
    <div className="flex h-[40px] w-full items-center justify-center">
      {answerTimerState?.owner === owner ? (
        <AnswerTimeProgress
          answerTime={answerTime}
          elapsedTime={answerTimerState.elapsedTime}
          isResetting={answerTimerState.status === 'resetting'}
          onClick={() => onClick(owner, isMainTimerRunning)}
        />
      ) : (
        <button
          type="button"
          className={
            'flex h-[40px] w-[168px] flex-shrink-0 items-center justify-center rounded-[44px] border border-default-disabled/hover bg-default-white font-semibold leading-none text-default-neutral xl:w-[208px]'
          }
          disabled={!isMainTimerRunning}
          onClick={() => onClick(owner, isMainTimerRunning)}
        >
          {t('답변시간 타이머 시작')}
        </button>
      )}
    </div>
  );
}
