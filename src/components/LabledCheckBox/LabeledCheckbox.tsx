import { InputHTMLAttributes, ReactNode } from 'react';

interface LabeledCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  checked: boolean;
  disabled?: boolean;
}

export default function LabeledCheckbox({
  label,
  checked,
  disabled = false,
  ...rest
}: LabeledCheckboxProps) {
  // Set label text color to...
  // - Black when checkbox is enabled
  // - Gray when checkbox is disabled

  return (
    <label
      className={`
        flex cursor-pointer items-center gap-2 text-sm md:text-base
        ${disabled ? 'text-neutral-400' : 'text-neutral-900'}
        `}
    >
      <input
        {...rest}
        type="checkbox"
        checked={checked}
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
