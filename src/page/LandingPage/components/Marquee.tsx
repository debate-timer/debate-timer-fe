import clsx from 'clsx';
import type { ReactNode } from 'react';

interface MarqueeProps {
  /** 흐르는 목록 영역의 접근성 이름 */
  label: string;
  children: ReactNode;
  /** 반대 방향(오른쪽)으로 흐르게 할 때 사용함 */
  isReversed?: boolean;
}

const EDGE_FADE =
  'w-full overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]';
const TRACK =
  'flex w-max animate-marquee gap-3 hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none';

/**
 * 내용을 가로로 끊김 없이 흘려 보여 주는 목록.
 * 같은 내용을 두 번 이어 붙이고 두 번째 묶음은 보조 기술·키보드 이동에서 제외함.
 * 마우스를 올리거나 포커스하면 멈추고, 움직임 줄이기 설정에서는 흐르지 않음.
 */
export default function Marquee(props: MarqueeProps) {
  const { label, children, isReversed = false } = props;

  return (
    <div role="region" aria-label={label} className={EDGE_FADE}>
      <div
        className={clsx(TRACK, isReversed && '[animation-direction:reverse]')}
      >
        <div className="flex gap-3">{children}</div>
        <div className="flex gap-3" aria-hidden="true" inert>
          {children}
        </div>
      </div>
    </div>
  );
}
