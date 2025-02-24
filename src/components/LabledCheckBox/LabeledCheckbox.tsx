import { InputHTMLAttributes } from 'react';

interface LabeledCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  checked: boolean;
}

export default function LabeledCheckbox({
  label,
  checked,
  ...rest
}: LabeledCheckboxProps) {
  const labelColorClass = checked ? '' : 'text-neutral-400';

  return (
    <label
      className={`flex items-center gap-2 text-sm md:text-base ${labelColorClass}`}
    >
      <input {...rest} type="checkbox" checked={checked} className="h-5 w-5" />
      {label}
    </label>
  );
}
