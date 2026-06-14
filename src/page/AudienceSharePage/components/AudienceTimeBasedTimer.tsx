import { useTranslation } from 'react-i18next';
import { TimeBasedStance } from '../../../type/type';
import { Formatting } from '../../../util/formatting';
import clsx from 'clsx';

export interface AudienceTimeBasedTimerProps {
  prosRemainingTime: number | null;
  consRemainingTime: number | null;
  currentTeam: TimeBasedStance;
}

export default function AudienceTimeBasedTimer({
  prosRemainingTime,
  consRemainingTime,
  currentTeam,
}: AudienceTimeBasedTimerProps) {
  const { t } = useTranslation();

  const formatTime = (time: number | null) => {
    if (time === null) return '--:--';
    return Formatting.formatSecondsToMMSS(time);
  };

  return (
    <div className="flex w-full flex-row space-x-8">
      {/* 찬성 팀 영역 */}
      <section
        className={clsx(
          'flex flex-1 flex-col items-center justify-center rounded-[16px] border-[4px] p-6',
          currentTeam === 'PROS'
            ? 'border-[#1E91D6] bg-[#C2E8FF]'
            : 'border-transparent bg-gray-100 opacity-50',
        )}
        aria-current={currentTeam === 'PROS' ? 'step' : undefined}
      >
        <div className="mb-2 flex h-8 items-center">
          {currentTeam === 'PROS' && (
            <span className="sr-only" data-testid="pros-speaking-status">
              {t('현재 발언 중')}
            </span>
          )}
          {currentTeam === 'PROS' && (
            <span
              className="rounded-full bg-[#1E91D6] px-3 py-1 text-sm font-bold text-white"
              aria-hidden="true"
            >
              {t('발언 중')}
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{t('찬성')}</h2>
        <div className="mt-4 text-[64px] font-bold tabular-nums text-gray-900">
          {formatTime(prosRemainingTime)}
        </div>
      </section>

      {/* 반대 팀 영역 */}
      <section
        className={clsx(
          'flex flex-1 flex-col items-center justify-center rounded-[16px] border-[4px] p-6',
          currentTeam === 'CONS'
            ? 'border-[#E14666] bg-[#FFC7D3]'
            : 'border-transparent bg-gray-100 opacity-50',
        )}
        aria-current={currentTeam === 'CONS' ? 'step' : undefined}
      >
        <div className="mb-2 flex h-8 items-center">
          {currentTeam === 'CONS' && (
            <span className="sr-only" data-testid="cons-speaking-status">
              {t('현재 발언 중')}
            </span>
          )}
          {currentTeam === 'CONS' && (
            <span
              className="rounded-full bg-[#E14666] px-3 py-1 text-sm font-bold text-white"
              aria-hidden="true"
            >
              {t('발언 중')}
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{t('반대')}</h2>
        <div className="mt-4 text-[64px] font-bold tabular-nums text-gray-900">
          {formatTime(consRemainingTime)}
        </div>
      </section>
    </div>
  );
}
