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
        'grid w-[5ch] grid-cols-[2ch_1ch_2ch] items-center justify-center gap-x-[0.33ch] font-bold tabular-nums leading-none md:leading-normal short:leading-none',
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
    !teamName || teamName.trim() === ''
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
      className="flex h-full min-w-0 flex-1 flex-col items-center justify-center rounded-[16px] px-1 py-4 [justify-content:safe_center] md:px-6 md:py-8 short:py-2"
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
          'w-full break-keep text-center text-[22px] font-bold md:text-[52px] xl:text-[68px] short:text-[22px]',
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
            className="mt-[24px] text-[length:min(11vw,64px)] md:mt-[64px] md:text-[70px] xl:text-[110px] short:mt-[8px] short:text-[length:min(22vh,96px)]"
          />
          <TimerProgressBar
            progress={progress}
            team={isCurrentTeam ? team : 'DISABLED'}
            isRunning={isRunning}
            className="mt-[32px] max-w-[560px] md:mt-[108px] short:mt-[16px] short:h-[12px] short:max-w-[280px]"
          />
        </>
      ) : (
        <>
          {/* 모바일(세로·가로)에서는 배지를 화면에서 숨기고 글자 크기 차이로 전체/현재 시간을 구분 */}
          <span
            className={clsx(
              'sr-only md:not-sr-only md:mt-[36px] md:flex md:h-[48px] md:w-[144px] md:items-center md:justify-center md:whitespace-nowrap md:rounded-[8px] md:text-[24px] md:text-default-white short:sr-only',
              isCurrentTeam ? 'bg-default-black' : 'bg-default-disabled/hover',
            )}
          >
            {t('전체 시간')}
          </span>
          <TimerValue
            seconds={totalRemainingTime}
            testId={`${teamId}-total-timer`}
            isDisabled={!isCurrentTeam}
            className="mt-[16px] text-[length:min(7.7vw,45px)] md:mt-[12px] md:text-[48px] lg:text-[56px] xl:text-[72px] short:mt-[8px] short:text-[length:min(14vh,45px)]"
          />
          <span
            className={clsx(
              'sr-only md:not-sr-only md:mt-[28px] md:flex md:h-[64px] md:w-[200px] md:items-center md:justify-center md:whitespace-nowrap md:rounded-[8px] md:text-[32px] md:text-default-white short:sr-only',
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
            className="mt-[20px] text-[length:min(11vw,64px)] md:mt-[12px] md:text-[70px] lg:text-[80px] xl:text-[110px] short:mt-[18px] short:text-[length:min(20vh,64px)]"
          />
          <TimerProgressBar
            progress={progress}
            team={isCurrentTeam ? team : 'DISABLED'}
            isRunning={isRunning}
            className="mt-[24px] max-w-[560px] md:mt-[64px] short:mt-[20px] short:h-[12px] short:max-w-[280px]"
          />
        </>
      )}
    </section>
  );
}
