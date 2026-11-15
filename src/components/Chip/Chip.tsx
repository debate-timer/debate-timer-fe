import { HTMLAttributes } from 'react';
import clsx from 'clsx';

type ChipVariant = 'primary' | 'secondary' | 'error';

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  shape?: 'pill' | 'rounded';
}

const BASE_CLASS =
  'inline-flex min-h-8 items-center justify-center gap-2 border px-2 text-ui-caption [&>svg]:size-5 [&>svg]:shrink-0';
const VARIANT_CLASS: Record<ChipVariant, string> = {
  primary: 'border-brand-hover bg-brand/15 text-neutral-900',
  secondary: 'border-neutral-300 bg-white text-neutral-500',
  error: 'border-red-300 bg-red-50 text-red-700',
};

/**
 * 상태나 짧은 보조 정보를 표시하는 비조작 컨테이너. Button과 같이 색상(variant)과
 * 형태(shape)를 분리하며 기본 secondary·rounded는 회색 테두리와 12px 모서리임.
 * primary는 브랜드 강조, error는 오류 표시이며 버튼과 구분되는 연한 배경을 사용함.
 * 최소 높이 32px·좌우 여백 8px·직접 자식 아이콘 20px을 제공하며 긴 내용은 높이가 늘어남.
 * 상태 판단·번역된 문구·아이콘·접근성 설명·포커스 필요 여부는 호출자가 소유함.
 * 기본적으로 버튼 역할이나 탭 정지점을 추가하지 않음.
 */
export default function Chip(props: ChipProps) {
  const {
    variant = 'secondary',
    shape = 'rounded',
    className,
    ...rest
  } = props;
  return (
    <span
      {...rest}
      className={clsx(
        BASE_CLASS,
        VARIANT_CLASS[variant],
        shape === 'pill' ? 'rounded-full' : 'rounded-xl',
        className,
      )}
    />
  );
}
