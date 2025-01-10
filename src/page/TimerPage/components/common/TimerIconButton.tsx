import { ChildProps } from 'postcss';
import { ReactElement } from 'react';

interface TimerIconButtonProps {
  onClick: () => void;
  icon: ReactElement<ChildProps>;
}

export default function TimerIconButton({
  icon,
  onClick,
}: TimerIconButtonProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-full bg-zinc-50 p-4 font-bold text-zinc-900 hover:bg-zinc-300"
    >
      {icon}
    </button>
  );
}
