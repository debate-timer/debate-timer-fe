import { useTranslation } from 'react-i18next';
import { DebateControls } from '../hooks/useDebateControls';

interface DebateFeatureIndicatorsProps {
  statuses: DebateControls['statuses'];
}

/** 수집 대기·처리 중 대신 기능별 세 가지 상태만 보여줌. */
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
      className="flex flex-wrap gap-x-4 gap-y-1 text-ui-caption text-neutral-800"
      aria-live="polite"
    >
      {(
        [
          ['share', '실시간 공유'],
          ['transcript', '속기록'],
          ['answer', '답변 시간'],
        ] as const
      ).map(([key, label]) => (
        <li
          key={key}
          className={statuses[key] === 'error' ? 'text-red-700' : undefined}
        >
          {t(label)}: {LABELS[statuses[key]]}
        </li>
      ))}
    </ul>
  );
}
