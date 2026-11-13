import { InputHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface LabeledCheckBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  checked: boolean;
  disabled?: boolean;
}

const CHECKBOX_CLASS =
  "relative flex size-5 shrink-0 appearance-none items-center justify-center rounded-sm border-2 border-neutral-400 bg-white text-neutral-900 checked:border-brand checked:bg-brand checked:before:text-base checked:before:leading-none checked:before:font-bold checked:before:text-white checked:before:content-['✓'] enabled:cursor-pointer enabled:hover:border-neutral-600 enabled:checked:hover:border-brand-hover enabled:checked:hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 disabled:cursor-not-allowed";

/** 네이티브 체크박스의 선택 동작과 레이블 클릭 영역을 제공하는 공용 선택지임. */
export default function LabeledCheckBox(props: LabeledCheckBoxProps) {
  const { label, checked, disabled = false, className, ...rest } = props;

  return (
    <label
      className={clsx(
        'flex min-h-11 items-center gap-2 text-ui-body select-none',
        disabled
          ? 'cursor-not-allowed text-neutral-500 opacity-50'
          : 'cursor-pointer text-neutral-900',
      )}
    >
      <input
        {...rest}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className={clsx(CHECKBOX_CLASS, className)}
      />
      <span className="min-w-0 wrap-break-word">{label}</span>
    </label>
  );
}
