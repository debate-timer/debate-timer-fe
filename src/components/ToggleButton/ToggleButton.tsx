import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ToggleButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'aria-pressed' | 'children'
> {
  'aria-label': string;
  isPressed: boolean;
  onPressedChange: (nextValue: boolean) => void;
}

const BUTTON_CLASS =
  'inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed';
const TRACK_CLASS =
  'flex h-7 w-12 items-center rounded-full transition-colors motion-reduce:transition-none';
const THUMB_CLASS =
  'size-5 rounded-full shadow-sm transition-transform motion-reduce:transition-none';

/**
 * 호출자가 상태를 확정하고 조작 시 다음 값만 전달하는 공용 토글임.
 *
 * 공용 `ToggleButton`은 필수 `aria-label`, `isPressed`, `onPressedChange`로 외부 상태를 표시하며 확인·오류·통신을 소유하지 않음.
 *
 */
export default function ToggleButton(props: ToggleButtonProps) {
  const {
    isPressed,
    onPressedChange,
    disabled,
    className,
    onClick,
    type = 'button',
    ...rest
  } = props;
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled}
      aria-pressed={isPressed}
      className={clsx(BUTTON_CLASS, className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          onPressedChange(!isPressed);
        }
      }}
    >
      <span
        aria-hidden="true"
        className={clsx(
          TRACK_CLASS,
          isPressed ? 'border-0 p-1' : 'border-2 border-neutral-400 p-0.5',
          disabled
            ? isPressed
              ? 'bg-neutral-400 opacity-50'
              : 'bg-neutral-100 opacity-50'
            : isPressed
              ? 'bg-brand hover:bg-brand-hover'
              : 'bg-neutral-200 hover:bg-neutral-300',
        )}
      >
        <span
          className={clsx(
            THUMB_CLASS,
            isPressed ? 'translate-x-5 bg-white' : 'bg-neutral-400',
          )}
        />
      </span>
    </button>
  );
}
