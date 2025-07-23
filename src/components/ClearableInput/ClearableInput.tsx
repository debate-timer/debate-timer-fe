import { InputHTMLAttributes } from 'react';
import { IoMdCloseCircle } from 'react-icons/io';

interface ClearableInputProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onClear: () => void;
}

export default function ClearableInput({
  value,
  onClear,
  ...rest
}: ClearableInputProps) {
  return (
    <div className="relative w-full">
      <input
        {...rest}
        value={value}
        className="text-body w-full rounded-[4px] border border-default-border p-[12px] text-default-black placeholder-default-border focus:outline-none"
      />
      {value && (
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
