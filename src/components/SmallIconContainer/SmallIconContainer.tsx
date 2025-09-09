import clsx from 'clsx';
import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

interface SmallIconContainerProps
  extends PropsWithChildren,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  background?: string;
  className?: string;
}

export default function SmallIconButtonContainer({
  background,
  children,
  className,
  ...buttonProps
}: SmallIconContainerProps) {
  return (
    <button
      {...buttonProps}
      className={clsx(
        'flex items-center justify-center rounded-[8px]',
        { 'bg-default-white': !background },
        { background: background },
        className,
      )}
    >
      {children}
    </button>
  );
}
