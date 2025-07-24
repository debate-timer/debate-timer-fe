import { InputHTMLAttributes, ReactNode } from 'react';

interface LabeledCheckBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  checked: boolean;
  disabled?: boolean;
}

export default function LabeledCheckBox({
  label,
  checked,
  disabled = false,
  ...rest
}: LabeledCheckBoxProps) {
  // Set label text color to...
  // - Black when checkbox is enabled
  // - Gray when checkbox is disabled

  return (
    <label
      className={`
        flex items-center gap-2 text-sm md:text-base
        ${disabled ? 'text-neutral-400' : 'cursor-pointer text-neutral-900'}
        `}
    >
      <input
        {...rest}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className={`
          relative
          h-5
          w-5 cursor-pointer
          appearance-none
          rounded-sm border
          border-neutral-300
          checked:border-transparent
          checked:bg-blue-500
          checked:before:absolute
          checked:before:left-1/2
          checked:before:top-[-4px]
          checked:before:-translate-x-1/2
          checked:before:text-xl
          checked:before:font-bold
          checked:before:text-background-default
          checked:before:content-['✓']
          focus:outline-none
        `}
      />
      {label}
    </label>
  );
}
