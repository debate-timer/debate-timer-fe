import clsx from 'clsx';

interface LabeledRadioButtonProps {
  id: string;
  name: string;
  value: string;
  label?: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const RADIO_CLASS =
  'relative flex size-5 shrink-0 appearance-none items-center justify-center rounded-full border-2 border-neutral-400 bg-white before:size-2.5 before:rounded-full before:bg-transparent checked:border-brand checked:before:bg-brand enabled:cursor-pointer enabled:hover:border-neutral-600 enabled:checked:hover:border-brand-hover enabled:checked:hover:before:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 disabled:cursor-not-allowed';

/** 네이티브 라디오의 선택 동작과 레이블 클릭 영역을 제공하는 공용 선택지임. */
export default function LabeledRadioButton(props: LabeledRadioButtonProps) {
  const { id, name, value, label, checked, onChange, disabled = false } = props;

  return (
    <label
      htmlFor={id}
      className={clsx(
        'flex min-h-11 items-center gap-2 text-ui-body select-none',
        disabled
          ? 'cursor-not-allowed text-neutral-500 opacity-50'
          : 'cursor-pointer text-neutral-900',
      )}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={RADIO_CLASS}
      />
      {label && <span className="min-w-0 wrap-break-word">{label}</span>}
    </label>
  );
}
