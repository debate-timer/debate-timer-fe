import { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
}

export default function IconButton({ icon, ...props }: IconButtonProps) {
  return (
    <button
      className="rounded-full bg-background-default px-2 py-2 font-bold text-neutral-900 hover:bg-neutral-300"
      {...props}
    >
      {icon}
    </button>
  );
}
