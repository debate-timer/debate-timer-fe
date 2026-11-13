import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type ButtonVariant =
  'primary' | 'secondary' | 'neutral' | 'dark' | 'light' | 'text';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  variant?: ButtonVariant;
  size?: 'default' | 'large';
  shape?: 'pill' | 'icon';
}

const BASE_CLASS =
  'inline-flex items-center justify-center gap-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none [&>svg]:shrink-0';
const SIZE_CLASS = {
  default: 'text-ui-label [&>svg]:size-5',
  large: 'text-ui-button-lg [&>svg]:size-6',
};
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-neutral-900 enabled:hover:bg-brand-hover',
  neutral: 'bg-neutral-100 text-neutral-900 enabled:hover:bg-neutral-200',
  secondary:
    'border border-neutral-900 bg-white text-neutral-900 enabled:hover:bg-neutral-100',
  dark: 'bg-neutral-900 text-white enabled:hover:bg-neutral-700',
  light: 'bg-white text-neutral-900 enabled:hover:bg-neutral-100',
  text: 'text-neutral-900 enabled:hover:text-neutral-600',
};

/**
 * 색상 변형과 상태 표현을 공유하며 동작의 의미와 처리는 호출자가 소유함.
 *
 * 공용 `Button`은 색상(`variant`)·크기(`size`)·형태(`shape`)를 별도로 선택함. 주요 행동은 `primary`, 차분한 보조 조작은 `neutral`, 존재감을 분명히 보여줄 대안 행동은 `secondary`를 사용함. `dark`·`light`는 브랜드색 배경에서 행동 위계를 유지하며 `text`는 면을 생략함. 선택 기준은 화면 경로가 아니라 해당 문맥의 행동 중요도임.
 *
 * 큰 버튼 전용 `text-ui-button-lg`는 24px·600 굵기·32px 행간이며 CSS 정의와 함께 갱신함.
 *
 * `size="default"`는 Label 문구와 20px 아이콘, 면이 있는 버튼의 최소 높이 52px를 사용함. `size="large"`는 `text-ui-button-lg` 문구와 24px 아이콘, 최소 높이 72px를 사용함. 큰 버튼의 글자 크기는 제목 역할과 분리함. `shape="icon"`은 기본 52px·큰 크기 72px의 원형이며 내부 패딩을 제거함. 일반 형태는 좌우 28px·상하 14px 여백을 사용하고 화면은 너비·배치를 소유함. 문구가 길면 최소 높이보다 확장할 수 있음. 아이콘과 문구를 항상 같은 크기로 맞추는 전역 규칙은 두지 않음.
 *
 * 호출자는 번역된 접근 가능한 이름·문구·콜백을 전달하며 기본 `type`은 `button`임. 로그인·이동·분석 이벤트는 호출자가 소유함. LandingPage와 TableComposition·TableOverview의 하단 버튼에 적용했으며 나머지 기존 `.button` 사용처의 일괄 이전은 수행하지 않았음.
 *
 * 공용 `Button`은 색상·크기·형태와 상태 표현을 소유함. 호출 화면은 배치·문구·동작을 소유함. 스타일만 반복되면 CSS utility를, 구조와 동작까지 반복되면 공용 컴포넌트를 검토하며 시각적 유사성만으로 상태와 기능을 합치지 않음.
 *
 */
export default function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'default',
    shape = 'pill',
    type = 'button',
    className,
    ...rest
  } = props;
  return (
    <button
      {...rest}
      type={type}
      className={clsx(
        BASE_CLASS,
        SIZE_CLASS[size],
        'rounded-full',
        shape === 'icon'
          ? size === 'large'
            ? 'size-18 shrink-0 p-0'
            : 'size-13 shrink-0 p-0'
          : variant !== 'text' && [
              'px-7 py-3.5',
              size === 'large' ? 'min-h-18' : 'min-h-13',
            ],
        VARIANT_CLASS[variant],
        className,
      )}
    />
  );
}
