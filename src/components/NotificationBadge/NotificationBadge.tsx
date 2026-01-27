import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export default function NotificationBadge({
  count,
  className = '',
}: NotificationBadgeProps) {
  const { t } = useTranslation();
  // 음수, NaN 등 의도하지 않은 값 확인
  const safeCount = Number.isFinite(count) ? Math.max(0, count) : 0;
  if (safeCount === 0) {
    return null;
  }

  const displayCount = safeCount > 99 ? '99+' : safeCount;

  return (
    <span
      role="status"
      aria-label={t('알림 {{displayCount}}개', { displayCount })}
      className={clsx(
        'inline-flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-semantic-error px-[4px] text-[10px] font-bold leading-none text-default-white',
        className,
      )}
    >
      {displayCount}
    </span>
  );
}
