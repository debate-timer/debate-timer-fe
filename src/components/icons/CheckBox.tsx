import DTCheck from './Check';
import clsx from 'clsx';

interface CheckBoxProps {
  checkColor?: string; // 체크 표시 색상
  checked?: boolean;
  size?: number | string;
  className?: string;
}

export default function CheckBox({
  checkColor = '#FFFFFF',
  checked = false,
  size = 24,
  className,
}: CheckBoxProps) {
  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-md border',
        checked ? 'border-transparent' : 'border-neutral-400',
        className,
      )}
      style={{
        width: size,
        height: size,
      }}
    >
      {checked && <DTCheck color={checkColor} className="w-2/3" />}
    </div>
  );
}
