import { useTranslation } from 'react-i18next';
import { Formatting } from '../../../util/formatting';
import { Stance } from '../../../type/type';
import DTDebate from '../../../components/icons/Debate';
import TimerProgressBar, {
  TimerProgressBarTeam,
} from '../../../components/TimerProgressBar/TimerProgressBar';
import { normalizeSpeechTypeKey } from '../../../util/speechType';

interface AudienceNormalTimerProps {
  remainingTime: number;
  totalTime: number;
  speechType: string;
  stance: Stance;
  teamName: string;
  speaker: string | null;
  isRunning: boolean;
}

function getProgressBarTeam(stance: Stance): TimerProgressBarTeam {
  return stance === 'NEUTRAL' ? 'DISABLED' : stance;
}

export default function AudienceNormalTimer({
  remainingTime,
  totalTime,
  speechType,
  stance,
  teamName,
  speaker,
  isRunning,
}: AudienceNormalTimerProps) {
  const { t } = useTranslation();
  const normalizedSpeechType = normalizeSpeechTypeKey(speechType);
  const speechTypeLabel = normalizedSpeechType
    ? t(normalizedSpeechType)
    : speechType;
  const teamLabel =
    !teamName || teamName.trim() === ''
      ? t('팀명 없음')
      : t('{{team}} 팀', { team: t(teamName) });
  // 토론자가 없으면 메인 타이머 화면처럼 토론자 표시를 생략
  const hasSpeaker = !!speaker && speaker.trim() !== '';
  const progress = ((totalTime - remainingTime) / totalTime) * 100;
  const [minutes, seconds] = Formatting.formatSecondsToMMSS(
    Math.abs(remainingTime),
  ).split(':');
  const isOvertime = remainingTime < 0;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center [justify-content:safe_center] md:px-4">
      <h1 className="break-keep text-center text-[36px] font-bold md:text-[52px] xl:text-[68px] short:text-[28px]">
        {speechTypeLabel}
      </h1>

      {stance !== 'NEUTRAL' && (
        <div
          className="mt-[12px] flex max-w-full items-center justify-center gap-2 text-[20px] md:mt-[24px] md:gap-4 md:text-[34px] short:mt-[4px] short:text-[18px]"
          data-testid="participant-row"
        >
          <DTDebate
            className="h-[20px] flex-shrink-0 md:h-[34px] short:h-[18px]"
            data-testid="debate-icon"
            aria-hidden="true"
          />
          <p className="min-w-0 truncate">{teamLabel}</p>
          {hasSpeaker && (
            <>
              <p aria-hidden="true">|</p>
              <p className="min-w-0 truncate">
                {t('{{speaker}} 토론자', { speaker: t(speaker) })}
              </p>
            </>
          )}
        </div>
      )}

      <span
        className="relative mt-[32px] grid w-[5ch] grid-cols-[2ch_1ch_2ch] items-center justify-center gap-x-[0.33ch] text-[length:min(20vw,96px)] font-bold tabular-nums leading-none text-default-black md:mt-[64px] md:text-[70px] md:leading-normal xl:text-[110px] short:mt-[8px] short:text-[length:min(22vh,96px)] short:leading-none"
        data-testid="timer-value"
        aria-label={`${isOvertime ? '- ' : ''}${minutes} : ${seconds}`}
      >
        {isOvertime ? (
          <span
            className="absolute right-full mr-[1ch]"
            data-testid="negative-sign"
            aria-hidden="true"
          >
            -
          </span>
        ) : null}
        <span className="text-right">{minutes}</span>
        <span className="text-center" aria-hidden="true">
          :
        </span>
        <span className="text-left">{seconds}</span>
      </span>

      <TimerProgressBar
        progress={progress}
        team={getProgressBarTeam(stance)}
        isRunning={isRunning}
        className="mt-[48px] max-w-[1280px] md:mt-[108px] short:mt-[16px] short:h-[12px] short:max-w-[480px]"
      />
    </div>
  );
}
