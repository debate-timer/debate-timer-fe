import { useTranslation } from 'react-i18next';
import { PiBroadcast } from 'react-icons/pi';
import { IoMicSharp, IoAlarmSharp } from 'react-icons/io5';
import { DebateControls } from '../hooks/useDebateControls';
import Chip from '../../../components/Chip/Chip';

interface DebateFeatureIndicatorsProps {
  statuses: DebateControls['statuses'];
  hasTranscriptFlag: boolean;
}

const FEATURES = [
  ['share', '실시간 공유', PiBroadcast],
  ['transcript', '속기록', IoMicSharp],
  ['answer', '답변 시간', IoAlarmSharp],
] as const;

const ROW_CLASS =
  'group relative flex rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900';
const TOOLTIP_CLASS =
  'pointer-events-none absolute top-full left-1/2 z-40 mt-2 -translate-x-1/2 rounded-lg bg-neutral-900 px-3 py-2 text-ui-caption whitespace-nowrap text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100';
const STATE_VARIANT = {
  inactive: 'secondary',
  active: 'primary',
  error: 'error',
} as const;
const DOT_CLASS = {
  inactive: 'bg-neutral-400',
  active: 'bg-brand-hover ring-2 ring-brand/30',
  error: 'bg-red-600',
};

/** 32px 높이의 아이콘·상태 점을 표시하며 호버와 키보드 포커스에 이름·상태를 제공함. */
export default function DebateFeatureIndicators(
  props: DebateFeatureIndicatorsProps,
) {
  const { statuses, hasTranscriptFlag } = props;
  const { t } = useTranslation();
  const LABELS = {
    inactive: t('비활성화'),
    active: t('활성화'),
    error: t('오류'),
  };
  const visibleFeatures = hasTranscriptFlag
    ? FEATURES
    : FEATURES.filter(([key]) => key !== 'transcript');
  return (
    <ul
      aria-label={t('토론 기능 상태')}
      className="flex items-center gap-2"
      aria-live="polite"
    >
      {visibleFeatures.map(([key, label, Icon]) => (
        <li
          key={key}
          tabIndex={0}
          aria-label={`${t(label)}: ${LABELS[statuses[key]]}`}
          className={ROW_CLASS}
        >
          <Chip variant={STATE_VARIANT[statuses[key]]} shape="rounded">
            <Icon aria-hidden="true" />
            <span
              className={`size-2 rounded-full ${DOT_CLASS[statuses[key]]}`}
              aria-hidden="true"
            />
          </Chip>
          <span className={TOOLTIP_CLASS} aria-hidden="true">
            {t(label)}: {LABELS[statuses[key]]}
          </span>
        </li>
      ))}
    </ul>
  );
}
