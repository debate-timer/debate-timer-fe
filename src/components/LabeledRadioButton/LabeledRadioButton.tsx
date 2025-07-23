interface LabeledRadioButtonProps {
  id: string;
  name: string;
  value: string;
  label?: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export default function LabeledRadioButton({
  id,
  name,
  value,
  label,
  checked,
  onChange,
  disabled = false,
}: LabeledRadioButtonProps) {
  const radioSize = 'size-[20px]';

  const checkedColorClass = 'bg-semantic-material border-semantic-material';
  const uncheckedColorClass =
    'bg-default-disabled/hover border-default-disabled/hover';

  const containerClasses = `
    flex items-center cursor-pointer select-none
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;
  const outerRingClasses = `
    relative flex items-center justify-center rounded-full transition-all duration-200 ease-in-out border-2
    ${radioSize}
    ${checked ? 'border-semantic-material' : 'border-default-disabled/hover'}
  `;
  const innerDotClasses = `
    rounded-full transition-all duration-200 ease-in-out w-2.5 h-2.5
    ${checked ? checkedColorClass : uncheckedColorClass}
  `;

  return (
    <label htmlFor={id} className={containerClasses}>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />

      <div className={outerRingClasses}>
        <div className={innerDotClasses}></div>
      </div>

      {label && (
        <span className="text-body ml-2 text-default-black">{label}</span>
      )}
    </label>
  );
}
