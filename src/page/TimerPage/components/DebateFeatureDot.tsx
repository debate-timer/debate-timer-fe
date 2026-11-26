import type { DebateFeatureStatus } from '../hooks/useDebateControls';

interface DebateFeatureDotProps {
  status: DebateFeatureStatus;
}

const DOT_CLASS = {
  inactive: 'bg-neutral-400',
  active: 'bg-brand-hover ring-2 ring-brand/30',
  error: 'bg-red-600',
} satisfies Record<DebateFeatureStatus, string>;

/** 헤더와 토론 메뉴에서 같은 크기와 색으로 상태를 보조한다. */
export default function DebateFeatureDot(props: DebateFeatureDotProps) {
  const { status } = props;
  return (
    <span
      className={`size-2 shrink-0 rounded-full ${DOT_CLASS[status]}`}
      aria-hidden="true"
    />
  );
}
