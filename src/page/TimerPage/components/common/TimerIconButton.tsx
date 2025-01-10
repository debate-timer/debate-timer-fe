import { ChildProps } from 'postcss';
import { ReactElement } from 'react';

interface TimerIconButtonProps {
  bgColor?: string;
  hoverColor?: string;
  contentColor?: string;
  onClick: () => void;
  icon: ReactElement<ChildProps>;
}

export default function TimerIconButton({
  bgColor,
  hoverColor,
  contentColor,
  icon,
  onClick,
}: TimerIconButtonProps) {
  const bgText = bgColor === undefined ? 'bg-zinc-50' : bgColor;
  const hoverText = hoverColor === undefined ? 'hover:bg-zinc-400' : hoverColor;
  const contentText =
    contentColor === undefined ? 'text-zinc-900' : contentColor;

  return (
    <button
      onClick={onClick}
      className={`rounded-full border-2 border-zinc-50 p-4 font-bold ${bgText} ${hoverText} ${contentText}`}
    >
      {icon}
    </button>
  );
}
