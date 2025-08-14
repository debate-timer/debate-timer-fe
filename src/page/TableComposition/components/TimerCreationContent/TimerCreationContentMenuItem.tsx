import clsx from 'clsx';
import { PropsWithChildren } from 'react';

interface TimerCreationContentItemProps extends PropsWithChildren {
  title: string;
  className?: string;
}

export default function TimerCreationContentItem({
  title,
  children,
  className = '',
}: TimerCreationContentItemProps) {
  return (
    <div
      className={clsx(
        'my-[4px] flex flex-row items-center space-x-[16px]',
        className,
      )}
    >
      <p className="text-body w-[80px] font-medium">{title}</p>
      <span className="flex-1">{children}</span>
    </div>
  );
}
