import { ChildProps } from 'postcss';
import { ReactElement } from 'react';

interface TimerIconButtonProps {
  style: {
    bgColor?: string;
    hoverColor?: string;
    contentColor?: string;
    className?: string;
  };
  onClick: () => void;
  icon: ReactElement<ChildProps>;
}

export default function TimerIconButton({
  icon,
  onClick,
  style,
}: TimerIconButtonProps) {
  const bgText = style.bgColor === undefined ? 'bg-zinc-50' : style.bgColor;
  const hoverText =
    style.hoverColor === undefined ? 'hover:bg-zinc-400' : style.hoverColor;
  const contentText =
    style.contentColor === undefined ? 'text-zinc-900' : style.contentColor;

  return (
    <button
      onClick={onClick}
      className={`rounded-full border-2 border-zinc-50 p-4 font-bold ${bgText} ${hoverText} ${contentText} ${style.className}`}
    >
      {icon}
    </button>
  );
}
