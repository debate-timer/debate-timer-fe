import { ReactNode } from 'react';
import clsx from 'clsx';
import Button, { ButtonProps } from '../Button/Button';

const SQUIRCLE_CLASS =
  'supports-[corner-shape:squircle]:rounded-[50%] [corner-shape:squircle]';

interface IconButtonProps extends Omit<
  ButtonProps,
  'children' | 'shape' | 'iconOnly'
> {
  icon: ReactNode;
  shape?: 'squircle' | 'rounded' | 'circle';
}

/**
 * 정사각형 아이콘 버튼. 색상·크기·포커스·비활성 처리는 Button을 재사용함.
 * 기본 형태는 rounded(반경 12px)이며 circle은 원형, squircle은 연속 곡률의 모서리임.
 * squircle은 corner-shape 지원 환경에서 적용하며 미지원 환경에서는 rounded로 표시함.
 * 기본 52px·large 72px이며 아이콘은 각각 20px·24px임. 호출자가 번역한 aria-label과
 * 장식 아이콘의 aria-hidden을 제공하며 기능 상태와 이벤트 처리를 소유함.
 */
export default function IconButton(props: IconButtonProps) {
  const { icon, shape = 'rounded', className, ...rest } = props;
  return (
    <Button
      {...rest}
      iconOnly
      shape={shape === 'circle' ? 'pill' : 'rounded'}
      className={clsx(shape === 'squircle' && SQUIRCLE_CLASS, className)}
    >
      {icon}
    </Button>
  );
}
