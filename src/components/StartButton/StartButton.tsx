import { PropsWithChildren } from 'react';

interface StartButtonProps extends PropsWithChildren {
  onClick: () => void;
}

export default function StartButton({ children, onClick }: StartButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-visible:outline-brand-main rounded-full border border-neutral-300 bg-brand px-5 py-2 text-[min(max(0.875rem,1.25vw),1.2rem)] font-medium text-default-black transition-all duration-100 hover:bg-semantic-table hover:text-default-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      {children}
    </button>
  );
}
