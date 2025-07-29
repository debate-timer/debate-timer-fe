import { InputHTMLAttributes } from 'react';
import { IoMdCloseCircle } from 'react-icons/io';

interface ClearableInputProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  disabled?: boolean;
  onClear: () => void;
}

export default function ClearableInput({
  value,
  onClear,
  disabled = false,
  ...rest
}: ClearableInputProps) {
  return (
    <div className="relative w-full">
      <input
        {...rest}
        value={value}
        disabled={disabled}
        className={`
          w-full rounded-md border border-neutral-300 p-3 pr-10 text-base text-neutral-900 placeholder-neutral-400 focus:outline-none
          ${disabled ? 'bg-neutral-400' : ''}
        `}
      />
      {value && !disabled && (
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
