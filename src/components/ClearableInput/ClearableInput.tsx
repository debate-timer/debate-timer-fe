import clsx from 'clsx';
import { InputHTMLAttributes } from 'react';
import { IoMdCloseCircle } from 'react-icons/io';

interface ClearableInputProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  disabled?: boolean;
  onClear?: () => void;
}

export default function ClearableInput({
  value,
  onClear,
  disabled = false,
  className,
  ...rest
}: ClearableInputProps) {
  return (
    <div className={clsx('relative w-full', className)}>
      <input
        {...rest}
        value={value}
        disabled={disabled}
        className="text-body h-[48px] w-full appearance-none rounded-[4px] border border-default-border p-[12px] text-default-black placeholder-default-border focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      {value && !disabled && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-neutral-400 hover:text-neutral-600"
        >
          <IoMdCloseCircle />
        </button>
      )}
    </div>
  );
}
