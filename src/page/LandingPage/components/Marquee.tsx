import clsx from 'clsx';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

interface MarqueeProps {
  /** 흐르는 목록 영역의 접근성 이름 */
  label: string;
  children: ReactNode;
  /** 반대 방향(오른쪽)으로 흐르게 할 때 사용함 */
  isReversed?: boolean;
}

const EDGE_FADE =
  'w-full overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]';
const SCROLL_SPEED = 40;

const TRACK =
  'flex w-max animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none';

/**
 * 내용을 가로로 끊김 없이 흘려 보여 주는 목록.
 * 내용을 영역 폭만큼 반복한 묶음을 두 번 이어 붙이고, 처음 한 벌만 보조 기술·키보드 이동에 노출함.
 * 마우스를 올리거나 포커스하면 멈추고, 움직임 줄이기 설정에서는 흐르지 않음.
 */
export default function Marquee(props: MarqueeProps) {
  const { label, children, isReversed = false } = props;
  const regionRef = useRef<HTMLDivElement>(null);
  const unitRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [repeatCount, setRepeatCount] = useState(1);
  const [duration, setDuration] = useState<number | null>(null);

  // 한 묶음이 영역보다 짧으면 -50% 이동 끝에서 빈 곳이 보이므로 영역을 덮을 만큼 반복함
  useLayoutEffect(() => {
    const region = regionRef.current;
    if (!region || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => {
      const unitWidth = unitRef.current?.offsetWidth ?? 0;
      if (unitWidth > 0) {
        setRepeatCount(Math.max(1, Math.ceil(region.clientWidth / unitWidth)));
      }
      const groupWidth = groupRef.current?.offsetWidth ?? 0;
      if (groupWidth > 0) {
        setDuration(groupWidth / SCROLL_SPEED);
      }
    });
    observer.observe(region);
    if (groupRef.current) {
      observer.observe(groupRef.current);
    }
    return () => observer.disconnect();
  }, [children]);

  const renderGroup = (isDuplicate: boolean) => (
    <div
      ref={isDuplicate ? undefined : groupRef}
      className="flex flex-none gap-3 pr-3"
      aria-hidden={isDuplicate || undefined}
      inert={isDuplicate || undefined}
    >
      {Array.from({ length: repeatCount }, (_, index) => {
        const isFirstUnit = !isDuplicate && index === 0;
        return (
          <div
            key={index}
            ref={isFirstUnit ? unitRef : undefined}
            className="flex flex-none gap-3"
            aria-hidden={isFirstUnit || isDuplicate ? undefined : true}
            inert={isFirstUnit || isDuplicate ? undefined : true}
          >
            {children}
          </div>
        );
      })}
    </div>
  );

  return (
    <div ref={regionRef} role="region" aria-label={label} className={EDGE_FADE}>
      <div
        className={clsx(TRACK, isReversed && '[animation-direction:reverse]')}
        style={duration ? { animationDuration: `${duration}s` } : undefined}
      >
        {/* 묶음 사이 간격을 각 묶음 끝 여백으로 두어야 -50% 이동이 정확히 한 묶음 길이가 됨 */}
        {renderGroup(false)}
        {renderGroup(true)}
      </div>
    </div>
  );
}
