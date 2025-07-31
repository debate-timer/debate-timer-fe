import { PropsWithChildren } from 'react';

interface TimerCreationContentItemProps extends PropsWithChildren {
  title: string;
}

export default function TimerCreationContentItem({
  title,
  children,
}: TimerCreationContentItemProps) {
  return (
    <div className="my-[4px] flex flex-row items-center space-x-[16px]">
      <p className="text-body w-[80px] font-bold">{title}</p>
      <span className="flex-1">{children}</span>
    </div>
  );
}
