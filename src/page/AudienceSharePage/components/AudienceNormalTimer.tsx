import { useTranslation } from 'react-i18next';
import { Formatting } from '../../../util/formatting';

interface AudienceNormalTimerProps {
  remainingTime: number;
}

export default function AudienceNormalTimer({
  remainingTime,
}: AudienceNormalTimerProps) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-[20px] xl:space-y-[36px]">
      <h1 className="text-center text-[52px] font-bold xl:text-[68px]">
        {t('남은 시간')}
      </h1>
      <span className="flex items-center justify-center p-[16px] text-[70px] font-bold tabular-nums text-default-black xl:text-[110px]">
        {Formatting.formatSecondsToMMSS(remainingTime)}
      </span>
    </div>
  );
}
