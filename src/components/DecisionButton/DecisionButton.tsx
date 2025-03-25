import { PropsWithChildren } from 'react';

interface DecisionButtonProps extends PropsWithChildren {
  onClick: () => void;
}

export default function DecisionButton({
  children,
  onClick,
}: DecisionButtonProps) {
  return (
    <button
      className="h-[88px] w-[1204px] rounded-[24px] border-[2px] border-neutral-700 bg-background-default text-[32px] font-bold text-neutral-900 hover:bg-brand-main"
      onClick={() => onClick()}
    >
      {children}
    </button>
  );
}
