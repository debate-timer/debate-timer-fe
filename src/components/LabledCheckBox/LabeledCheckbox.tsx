import { InputHTMLAttributes, ReactNode } from 'react';

interface LabeledCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  checked: boolean;
}

export default function LabeledCheckbox({
  label,
  checked,
  ...rest
}: LabeledCheckboxProps) {
  // 체크 안 된 상태일 때 라벨 색을 회색으로
  const labelColorClass = checked ? '' : 'text-default-disabled/hover';
  const checkedColorClass = `
    checked:bg-brand checked:text-default-white checked:border-transparent 
    checked:before:absolute
    checked:before:left-1/2
    checked:before:top-[-6px]
    checked:before:-translate-x-1/2
    checked:before:text-xl
    checked:before:font-bold
    checked:before:content-['✓']
    checked:before:text-background-default
  `;
  const uncheckedColorClass = 'border-default-border border';

  return (
    <label
      className={`flex cursor-pointer items-center gap-2 text-sm md:text-base ${labelColorClass}`}
    >
      <input
        {...rest}
        type="checkbox"
        checked={checked}
        className={`
          relative
          size-[20px]
          cursor-pointer appearance-none
          rounded-sm
          focus:outline-none
          ${checkedColorClass}
          ${uncheckedColorClass}
        `}
      />
      {label}
    </label>
  );
}
