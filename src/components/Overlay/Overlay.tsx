import {
  AnimatePresence,
  HTMLMotionProps,
  motion,
  useIsPresent,
  useReducedMotion,
} from 'framer-motion';
import clsx from 'clsx';

interface OverlayProps extends Omit<
  HTMLMotionProps<'div'>,
  'initial' | 'animate' | 'exit' | 'transition'
> {
  isOpen?: boolean;
  direction?: 'none' | 'up' | 'down' | 'left' | 'right';
}

const CONTAINER_CLASS =
  'rounded-xl border border-neutral-300 bg-white p-4 shadow-lg';
const INITIAL_OFFSET = {
  none: { x: 0, y: 0 },
  up: { x: 0, y: 8 },
  down: { x: 0, y: -8 },
  left: { x: 8, y: 0 },
  right: { x: -8, y: 0 },
};

/**
 * 흰 배경·12px 모서리·중립색 테두리·16px 여백·그림자를 제공하는 공용 떠 있는 면임.
 * direction은 등장 시 이동할 목적지 방향이며 기본값 none은 애니메이션 없이 표시·숨김 처리함.
 * 네 방향은 반대편 8px에서 제자리로 0.16초 동안 페이드 인하고, 닫을 때 반대 방향으로 페이드 아웃함.
 * 움직임 감소 설정에서는 즉시 표시·숨김 처리함.
 * 호출자는 컴포넌트를 유지한 채 isOpen(기본 true)으로 개폐해야 종료 애니메이션을 재생할 수 있음.
 * className으로 위치·크기를 지정하며 종료 중인 내용은 접근성과 조작 대상에서 제외함.
 * 배경 차단·포털·바깥 클릭·Escape·포커스·접근성 역할은 호출자가 용도에 맞게 관리함.
 */
export default function Overlay(props: OverlayProps) {
  const { isOpen = true, ...rest } = props;
  return (
    <AnimatePresence>{isOpen && <OverlaySurface {...rest} />}</AnimatePresence>
  );
}

/** 종료 애니메이션 중에는 면을 유지하면서 조작·접근성 대상에서 제외함. */
function OverlaySurface(props: Omit<OverlayProps, 'isOpen'>) {
  const { children, className, direction = 'none', ...rest } = props;
  const shouldReduceMotion = useReducedMotion();
  const isPresent = useIsPresent();
  const hasAnimation = direction !== 'none' && !shouldReduceMotion;
  const hiddenState = { opacity: 0, ...INITIAL_OFFSET[direction] };

  return (
    <motion.div
      {...rest}
      inert={!isPresent || rest.inert}
      aria-hidden={!isPresent || rest['aria-hidden']}
      className={clsx(CONTAINER_CLASS, className)}
      initial={hasAnimation ? hiddenState : false}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={hasAnimation ? hiddenState : { opacity: 1, x: 0, y: 0 }}
      transition={{ duration: hasAnimation ? 0.16 : 0, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
