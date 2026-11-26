import { ReactNode, useId } from 'react';
import clsx from 'clsx';
import ToggleButton from '../../../components/ToggleButton/ToggleButton';
import DebateFeatureDot from './DebateFeatureDot';

interface DebateFeatureSectionProps {
  title: string;
  toggleLabel?: string;
  description: string;
  active: boolean;
  disabled?: boolean;
  status?: string;
  hasError?: boolean;
  onToggle: (next: boolean) => void;
  children?: ReactNode;
}

/** 토론 기능의 토글, 설명과 상세 영역을 같은 형식으로 배치한다. */
export default function DebateFeatureSection(props: DebateFeatureSectionProps) {
  const {
    title,
    toggleLabel = title,
    description,
    active,
    disabled,
    status,
    hasError,
    onToggle,
    children,
  } = props;
  const descriptionId = useId();
  return (
    <section aria-label={title}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="text-ui-label">{title}</h3>
          {status && (
            <p
              role="status"
              className="flex items-center gap-2 text-ui-caption text-neutral-700"
            >
              <DebateFeatureDot
                status={hasError ? 'error' : active ? 'active' : 'inactive'}
              />
              {status}
            </p>
          )}
        </div>
        <ToggleButton
          aria-label={toggleLabel}
          aria-describedby={descriptionId}
          isPressed={active}
          disabled={disabled}
          onPressedChange={onToggle}
        />
      </div>
      <p
        id={descriptionId}
        className="pt-2 pb-4 text-ui-caption text-neutral-700"
      >
        {description}
      </p>
      {children && (
        <div
          className={clsx(
            'space-y-3 rounded-xl border p-4 text-ui-body',
            hasError
              ? 'border-red-200 bg-red-50'
              : 'border-neutral-200 bg-neutral-50',
          )}
        >
          {children}
        </div>
      )}
    </section>
  );
}
