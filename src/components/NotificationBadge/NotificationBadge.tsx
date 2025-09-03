import clsx from 'clsx';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export default function NotificationBadge({
  count,
  className = '',
}: NotificationBadgeProps) {
  if (count === 0) {
    return null;
  }

  const displayCount = count > 99 ? '99+' : count;

  return (
    <span
      className={clsx(
        'inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white',
        className,
      )}
    >
      {displayCount}
    </span>
  );
}
