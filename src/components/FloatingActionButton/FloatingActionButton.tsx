import { PropsWithChildren } from 'react';

interface FloatingActionButtonProps extends PropsWithChildren {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export default function TimeBoxAddButton({
  onClick,
  disabled = false,
  className = '',
  children,
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex rounded-[16px] shadow-xl
        ${className}
      `}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
