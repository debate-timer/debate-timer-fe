import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import TimerProgressBar from '../../../components/TimerProgressBar/TimerProgressBar';
import { TimeBasedStance } from '../../../type/type';
import { Formatting } from '../../../util/formatting';

interface AudienceTimeBasedTimerDisplayProps {
  team: TimeBasedStance;
  teamName: string;
  timePerTeam: number;
  timePerSpeaking: number | null;
  totalRemainingTime: number;
  currentSpeakingRemainingTime: number | null;
  isCurrentTeam: boolean;
  isRunning: boolean;
}

interface TimerValueProps {
  seconds: number;
  testId: string;
  isDisabled: boolean;
  className?: string;
}

function TimerValue({
  seconds,
  testId,
  isDisabled,
  className,
}: TimerValueProps) {
  const normalizedSeconds = Math.max(0, seconds);
  const [minutes, remainingSeconds] =
    Formatting.formatSecondsToMMSS(normalizedSeconds).split(':');

  return (
    <span
      className={clsx(
        'grid w-[5ch] grid-cols-[2ch_1ch_2ch] items-center justify-center gap-x-[0.33ch] font-bold tabular-nums',
        isDisabled ? 'text-default-disabled/hover' : 'text-default-black',
        className,
      )}
      data-testid={testId}
      aria-label={`${minutes} : ${remainingSeconds}`}
    >
      <span className="text-right">{minutes}</span>
      <span className="text-center" aria-hidden="true">
        :
      </span>
      <span className="text-left">{remainingSeconds}</span>
    </span>
  );
}

export default function AudienceTimeBasedTimerDisplay({
  team,
  teamName,
  timePerTeam,
  timePerSpeaking,
  totalRemainingTime,
  currentSpeakingRemainingTime,
  isCurrentTeam,
  isRunning,
}: AudienceTimeBasedTimerDisplayProps) {
  const { t } = useTranslation();
  const teamId = team.toLowerCase();
  const teamLabel =
    teamName.trim() === ''
      ? t('팀명 없음')
      : t('{{team}} 팀', { team: t(teamName) });
  const progressBase = timePerSpeaking === null ? timePerTeam : timePerSpeaking;
  const progressRemaining =
    timePerSpeaking === null
      ? totalRemainingTime
      : (currentSpeakingRemainingTime ?? timePerSpeaking);
  const progress = ((progressBase - progressRemaining) / progressBase) * 100;
  const activeCurrentBadgeClass =
    team === 'PROS' ? 'bg-camp-blue' : 'bg-camp-red';

  return (
    <section
      className="flex h-full min-w-0 flex-1 flex-col items-center justify-center rounded-[16px] px-6 py-8"
      data-testid={`${teamId}-timer-display`}
      aria-current={isCurrentTeam ? 'step' : undefined}
    >
      {isCurrentTeam ? (
        <span className="sr-only" data-testid={`${teamId}-speaking-status`}>
          {t('현재 발언 중')}
        </span>
      ) : null}

      <h1
        className={clsx(
          'text-center text-[52px] font-bold xl:text-[68px]',
          !isCurrentTeam && 'text-default-disabled/hover',
        )}
      >
        {teamLabel}
      </h1>

      {timePerSpeaking === null ? (
        <>
          <TimerValue
            seconds={totalRemainingTime}
            testId={`${teamId}-total-timer`}
            isDisabled={!isCurrentTeam}
            className="mt-[64px] text-[70px] xl:text-[110px]"
          />
          <TimerProgressBar
            progress={progress}
            team={isCurrentTeam ? team : 'DISABLED'}
            isRunning={isRunning}
            className="mt-[108px] max-w-[560px]"
          />
        </>
      ) : (
        <>
          <span
            className={clsx(
              'mt-[36px] flex h-[48px] w-[144px] items-center justify-center rounded-[8px] text-[24px] text-default-white',
              isCurrentTeam ? 'bg-default-black' : 'bg-default-disabled/hover',
            )}
          >
            {t('전체 시간')}
          </span>
          <TimerValue
            seconds={totalRemainingTime}
            testId={`${teamId}-total-timer`}
            isDisabled={!isCurrentTeam}
            className="mt-[12px] text-[108px]"
          />
          <span
            className={clsx(
              'mt-[28px] flex h-[64px] w-[200px] items-center justify-center rounded-[8px] text-[32px] text-default-white',
              isCurrentTeam
                ? activeCurrentBadgeClass
                : 'bg-default-disabled/hover',
            )}
          >
            {t('현재 시간')}
          </span>
          <TimerValue
            seconds={currentSpeakingRemainingTime ?? 0}
            testId={`${teamId}-current-timer`}
            isDisabled={!isCurrentTeam}
            className="mt-[12px] text-[70px] xl:text-[110px]"
          />
          <TimerProgressBar
            progress={progress}
            team={isCurrentTeam ? team : 'DISABLED'}
            isRunning={isRunning}
            className="mt-[64px] max-w-[560px]"
          />
        </>
      )}
    </section>
  );
}
