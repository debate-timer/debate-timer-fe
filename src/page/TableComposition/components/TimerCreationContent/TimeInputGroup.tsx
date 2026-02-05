import { useTranslation } from 'react-i18next';
import ClearableInput from '../../../../components/ClearableInput/ClearableInput';
import TimerCreationContentItem from './TimerCreationContentMenuItem';

interface TimeInputGroupProps {
  title: string;
  minutes: number;
  seconds: number;
  onMinutesChange: (value: number) => void;
  onSecondsChange: (value: number) => void;
}

export default function TimeInputGroup({
  title,
  minutes,
  seconds,
  onMinutesChange,
  onSecondsChange,
}: TimeInputGroupProps) {
  const { t } = useTranslation();
  const validateTime = (value: string) =>
    value === '' ? 0 : Math.max(0, Math.min(59, Number(value)));

  return (
    <TimerCreationContentItem title={title}>
      <span className="flex flex-row">
        <span className="flex flex-1 flex-row items-center space-x-[8px]">
          <ClearableInput
            type="number"
            value={minutes.toString()}
            onChange={(e) => onMinutesChange(validateTime(e.target.value))}
            onClear={() => onMinutesChange(0)}
          />

          <p className="text-body">{t('분')}</p>
        </span>
        <span className="w-[16px]"></span>
        <span className="flex flex-1 flex-row items-center space-x-[8px]">
          <ClearableInput
            type="number"
            value={seconds.toString()}
            onChange={(e) => onSecondsChange(validateTime(e.target.value))}
            onClear={() => onSecondsChange(0)}
          />

          <p className="text-body">{t('초')}</p>
        </span>
      </span>
    </TimerCreationContentItem>
  );
}
