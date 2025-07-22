import { PropsWithChildren } from 'react';

interface SmallIconButton extends PropsWithChildren {
  background?: string;
  className?: string;
}

export default function SmallIconContainer({
  background,
  children,
  className,
}: SmallIconButton) {
  return (
    <button
      className={`
        flex items-center justify-center rounded-[8px]
        ${background ? background : 'bg-default-white'}
        ${className ? className : ''}
      `}
    >
      {children}
    </button>
  );
}
