import { PropsWithChildren } from 'react';

interface DecisionButtonProps extends PropsWithChildren {
  onClick: () => void;
  enabled?: boolean;
}

export default function DecisionButton({
  children,
  enabled,
  onClick,
}: DecisionButtonProps) {
  // If enabled is not given, treat it as true
  if (enabled === undefined || enabled === null) {
    enabled = true;
  }

  // Set color by whether button is enabled
  const bgColor = enabled ? 'bg-background-default' : 'bg-neutral-300';
  const hoverBgColor = enabled ? 'hover:bg-brand-main' : '';
  const textColor = enabled ? 'text-neutral-900' : 'text-neutral-500';

  return (
    <button
      className={`h-[88px] w-[1204px] rounded-[24px] border-[2px] border-neutral-700 ${bgColor} text-[32px] font-bold ${textColor} ${hoverBgColor}`}
      onClick={() => {
        if (enabled) {
          onClick();
        }
      }}
    >
      {children}
    </button>
  );
}
