import DTCheck from './Check';
import clsx from 'clsx';

interface CheckBoxProps {
  checked?: boolean;
  size?: number | string;
  className?: string;
}

/**
 *text-* 클래스가 포함되면 자동으로 DTCheck로 전달
 */
export default function CheckBox({
  checked = false,
  size = 24,
  className = '',
}: CheckBoxProps) {
  // text-로 시작하는 클래스만 추출
  const textClass =
    className.split(' ').find((c) => c.startsWith('text-')) ?? '';

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
      {checked && <DTCheck className={clsx('w-2/3', textClass)} />}
    </div>
  );
}
