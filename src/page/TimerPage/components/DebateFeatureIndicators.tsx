import { useTranslation } from 'react-i18next';
import { PiBroadcast } from 'react-icons/pi';
import { IoMicSharp, IoAlarmSharp } from 'react-icons/io5';
import { DebateControls } from '../hooks/useDebateControls';

interface DebateFeatureIndicatorsProps {
  statuses: DebateControls['statuses'];
}

const ROW_CLASS =
  'group relative flex h-8 items-center gap-2 rounded-xl border px-2 focus-visible:outline-2 focus-visible:outline-offset-2';
const TOOLTIP_CLASS =
  'pointer-events-none absolute top-full left-1/2 z-40 mt-2 -translate-x-1/2 rounded-lg bg-neutral-900 px-3 py-2 text-ui-caption whitespace-nowrap text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100';
const STATE_CLASS = {
  inactive: 'border-neutral-300 bg-white text-neutral-500',
  active: 'border-brand-hover bg-brand/15 text-neutral-900',
  error: 'border-red-300 bg-red-50 text-red-700',
};
const DOT_CLASS = {
  inactive: 'bg-neutral-400',
  active: 'bg-brand-hover ring-2 ring-brand/30',
  error: 'bg-red-600',
};

/** 32px 높이의 아이콘·상태 점을 표시하며 호버와 키보드 포커스에 이름·상태를 제공함. */
export default function DebateFeatureIndicators(
  props: DebateFeatureIndicatorsProps,
) {
  const { statuses } = props;
  const { t } = useTranslation();
  const LABELS = {
    inactive: t('비활성화'),
    active: t('활성화'),
    error: t('오류'),
  };
  return (
    <ul
      aria-label={t('토론 기능 상태')}
      className="flex items-center gap-2"
      aria-live="polite"
    >
      {(
        [
          ['share', '실시간 공유', PiBroadcast],
          ['transcript', '속기록', IoMicSharp],
          ['answer', '답변 시간', IoAlarmSharp],
        ] as const
      ).map(([key, label, Icon]) => (
        <li
          key={key}
          tabIndex={0}
          aria-label={`${t(label)}: ${LABELS[statuses[key]]}`}
          className={`${ROW_CLASS} ${STATE_CLASS[statuses[key]]}`}
        >
          <Icon className="size-5" aria-hidden="true" />
          <span
            className={`size-2 rounded-full ${DOT_CLASS[statuses[key]]}`}
            aria-hidden="true"
          />
          <span className={TOOLTIP_CLASS} aria-hidden="true">
            {t(label)}: {LABELS[statuses[key]]}
          </span>
        </li>
      ))}
    </ul>
  );
}
