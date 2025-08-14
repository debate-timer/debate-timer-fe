import { PropsWithChildren } from 'react';

interface FloatingActionButtonProps extends PropsWithChildren {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Material 3의 Floating Action Button입니다.
 * 개발 과정에서의 유연성을 위해 Padding을 명시하지는 않았으나,
 * p-[16px]이 적정 값임을 알립니다.
 */
export default function FloatingActionButton({
  onClick,
  disabled = false,
  className = '',
  children,
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex rounded-[16px] shadow-xl transition-all duration-200 ease-in-out
        ${className}
      `}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
