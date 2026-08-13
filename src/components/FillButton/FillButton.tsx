import { PropsWithChildren } from 'react';

type FillButtonVariant = 'primary' | 'secondary';
type FillButtonSize = 'sm' | 'md' | 'lg';

interface FillButtonProps extends PropsWithChildren {
  onClick: () => void;
  variant?: FillButtonVariant;
  size?: FillButtonSize;
}

const VARIANT_CLASSNAMES: Record<FillButtonVariant, string> = {
  primary:
    'bg-brand hover:bg-semantic-table hover:text-default-white focus-visible:outline-brand-main focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4',
  secondary: 'bg-neutral-200 hover:bg-brand',
};

const SIZE_CLASSNAMES: Record<FillButtonSize, string> = {
  sm: 'px-5',
  md: 'px-9',
  lg: 'px-20',
};

export default function FillButton({
  children,
  onClick,
  variant = 'primary',
  size = 'sm',
}: FillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border border-neutral-300 py-2 text-[min(max(0.875rem,1.25vw),1.2rem)] font-medium text-default-black transition-all duration-100 ${VARIANT_CLASSNAMES[variant]} ${SIZE_CLASSNAMES[size]}`}
    >
      {children}
    </button>
  );
}
