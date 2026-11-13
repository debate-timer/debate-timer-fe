import clsx from 'clsx';
import { InputHTMLAttributes, useId } from 'react';
import { IoMdCloseCircle } from 'react-icons/io';
import { useTranslation } from 'react-i18next';

interface ClearableInputProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  /** 전달한 경우에만 값이 있는 활성 입력에 클리어 버튼을 표시함. */
  onClear?: () => void;
  isError?: boolean;
  maxCount?: number;
  errorMessage?: string;
}

const INPUT_CLASS =
  'form-control-border text-ui-body h-12 w-full appearance-none bg-white py-2.5 pl-3 text-neutral-900 placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500 disabled:placeholder:text-neutral-400 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';
const CLEAR_BUTTON_CLASS =
  'absolute top-1 right-1 flex size-10 items-center justify-center rounded-full text-xl text-neutral-400 before:absolute before:size-5 before:rounded-full hover:before:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 [&>svg]:relative';

/**
 * 입력과 지우기 조작, 공간을 확보하는 오류 설명·카운터를 제공함.
 *
 * 공용 `ClearableInput`은 입력 ID를 보존하거나 생성하고 외부 설명과 내부 오류 ID를 병합함. 지우기 버튼은 값·활성 상태·콜백 유무에 따라 표시하며 오류 설명과 카운터는 높이를 확보하는 행에 배치함.
 *
 */
export default function ClearableInput(props: ClearableInputProps) {
  const {
    value,
    onClear,
    disabled = false,
    isError = false,
    maxCount,
    errorMessage,
    className,
    id,
    'aria-describedby': describedBy,
    ...rest
  } = props;
  const { t } = useTranslation();
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hasClearButton = Boolean(value && !disabled && onClear);
  const hasCounter = typeof maxCount === 'number';
  const isOverLimit = hasCounter && value.length > maxCount;
  const errorId = errorMessage ? `${inputId}-error` : undefined;
  const descriptionIds =
    [describedBy, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={clsx('relative w-full', className)}>
      <input
        {...rest}
        id={inputId}
        value={value}
        disabled={disabled}
        aria-invalid={isError || undefined}
        aria-describedby={descriptionIds}
        className={clsx(INPUT_CLASS, hasClearButton ? 'pr-12' : 'pr-3')}
      />
      {hasClearButton && (
        <button
          type="button"
          aria-label={t('입력 내용 지우기')}
          onClick={onClear}
          className={CLEAR_BUTTON_CLASS}
        >
          <IoMdCloseCircle aria-hidden="true" />
        </button>
      )}
      {(hasCounter || errorMessage) && (
        <div className="mt-0.5 grid grid-cols-[minmax(0,1fr)_auto] gap-x-2 px-1">
          {errorMessage && (
            <span
              id={errorId}
              role="alert"
              aria-live="polite"
              className="col-start-1 row-start-1 min-w-0 text-ui-caption wrap-break-word text-red-500"
            >
              {errorMessage}
            </span>
          )}
          {hasCounter && (
            <span
              aria-live="polite"
              className={clsx(
                'pointer-events-none col-start-2 row-start-1 text-ui-caption tabular-nums',
                isOverLimit ? 'font-semibold text-red-500' : 'text-neutral-500',
              )}
            >
              {t('{{current}}/{{max}}', {
                current: value.length,
                max: maxCount,
              })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
