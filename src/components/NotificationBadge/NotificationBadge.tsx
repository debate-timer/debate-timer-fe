import type { HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface NotificationBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  count: number;
}

const MAX_DISPLAY_COUNT = 99;
const BADGE_CLASS =
  'inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-red-700 px-1.5 text-ui-caption text-white tabular-nums';

/**
 * 배경과 숫자로 알림 수를 표시하는 비조작 배지. 높이와 최소 너비는 24px이며
 * 숫자가 길면 너비를 늘림. 유한한 양수만 표시하고 99를 넘으면 99+로 표시함.
 * 기본 접근성 이름은 번역된 알림 수이며, 배치와 중복 안내 방지는 호출자가 맡음.
 */
export default function NotificationBadge(props: NotificationBadgeProps) {
  const { count, className, ...rest } = props;
  const { t } = useTranslation();
  if (!Number.isFinite(count) || count <= 0) {
    return null;
  }

  const displayCount =
    count > MAX_DISPLAY_COUNT ? `${MAX_DISPLAY_COUNT}+` : count;

  return (
    <span
      role="status"
      aria-label={t('알림 개수', { count, displayCount })}
      {...rest}
      className={clsx(BADGE_CLASS, className)}
    >
      {displayCount}
    </span>
  );
}
