import clsx from 'clsx';
import { InputHTMLAttributes } from 'react';
import { IoMdCloseCircle } from 'react-icons/io';
import { useTranslation } from 'react-i18next';

interface ClearableInputProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  disabled?: boolean;
  onClear?: () => void;
  /** 검증 실패 시 붉은 테두리로 표시 */
  isError?: boolean;
  /** 설정 시 입력창 경계 바로 아래에 `현재/최대` 글자 수 카운터를 노출한다. */
  maxCount?: number;
}

export default function ClearableInput({
  value,
  onClear,
  disabled = false,
  isError = false,
  maxCount,
  className,
  ...rest
}: ClearableInputProps) {
  const { t } = useTranslation();
  const hasCounter = typeof maxCount === 'number';
  const isOverLimit = hasCounter && value.length > maxCount;

  return (
    <div className={clsx('relative w-full', className)}>
      <input
        {...rest}
        value={value}
        disabled={disabled}
        aria-invalid={isError || undefined}
        className={clsx(
          'text-body h-[48px] w-full appearance-none rounded-[4px] p-[12px] text-default-black placeholder-default-border focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          // box-border 기준이라 테두리를 굵혀도 외곽 크기(48px)는 유지 → 레이아웃 밀림 없음
          isError
            ? 'border-2 border-semantic-error'
            : 'border border-default-border',
        )}
      />
      {value && !disabled && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-neutral-400 hover:text-neutral-600"
        >
          <IoMdCloseCircle />
        </button>
      )}
      {hasCounter && (
        // 박스 경계 바로 아래에 절대배치 → 레이아웃을 밀지 않아 행 간격이 균일하게 유지된다.
        <span
          aria-live="polite"
          className={clsx(
            'pointer-events-none absolute right-1 top-full mt-[2px] text-[11px] leading-none',
            isOverLimit
              ? 'font-semibold text-semantic-error'
              : 'text-default-neutral',
          )}
        >
          {t('{{current}}/{{max}}', {
            current: value.length,
            max: maxCount,
          })}
        </span>
      )}
    </div>
  );
}
