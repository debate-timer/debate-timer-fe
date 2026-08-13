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
  const speakerLabel =
    !speaker || speaker.trim() === ''
      ? t('토론자 없음')
      : t('{{speaker}} 토론자', { speaker: t(speaker) });
  const progress = ((totalTime - remainingTime) / totalTime) * 100;
  const [minutes, seconds] = Formatting.formatSecondsToMMSS(
    Math.abs(remainingTime),
  ).split(':');
  const isOvertime = remainingTime < 0;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-4">
      <h1 className="text-center text-[52px] font-bold xl:text-[68px]">
        {speechTypeLabel}
      </h1>

      {stance !== 'NEUTRAL' && (
        <div
          className="mt-[24px] flex max-w-full items-center justify-center gap-4 text-[34px]"
          data-testid="participant-row"
        >
          <DTDebate
            className="h-[34px] flex-shrink-0"
            data-testid="debate-icon"
            aria-hidden="true"
          />
          <p className="min-w-0 truncate">{teamLabel}</p>
          <p aria-hidden="true">|</p>
          <p className="min-w-0 truncate">{speakerLabel}</p>
        </div>
      )}

      <span
        className="relative mt-[64px] grid w-[5ch] grid-cols-[2ch_1ch_2ch] items-center justify-center gap-x-[0.33ch] text-[70px] font-bold tabular-nums text-default-black xl:text-[110px]"
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
        className="mt-[108px] max-w-[1280px]"
      />
    </div>
  );
}
