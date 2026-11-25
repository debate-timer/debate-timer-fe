import {
  AnimatePresence,
  HTMLMotionProps,
  motion,
  useIsPresent,
  useReducedMotion,
} from 'framer-motion';
import clsx from 'clsx';
import { ReactNode, useCallback, useLayoutEffect, useRef } from 'react';

interface OverlayProps extends Omit<
  HTMLMotionProps<'div'>,
  'initial' | 'animate' | 'exit' | 'transition' | 'children'
> {
  isOpen?: boolean;
  direction?: 'none' | 'up' | 'down' | 'left' | 'right';
  /** 내부 스크롤 영역에 적용할 여백·간격 등 레이아웃 클래스임. */
  contentClassName?: string;
  children?: ReactNode;
}

const CONTAINER_CLASS =
  'flex flex-col overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-lg';
const CONTENT_CLASS = 'min-h-0 flex-1 overflow-auto p-4';
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
 * className으로 바깥 위치·크기를, contentClassName으로 내부 스크롤 영역의 여백·간격을 지정하며 종료 중인 내용은 접근성과 조작 대상에서 제외함.
 * 바깥 면은 둥근 모서리로 클리핑하고 내부 스크롤 영역이 스크롤을 담당해 스크롤바가 모서리 형태를 훼손하지 않음.
 * 화면 네 변에서 16px 여백을 유지하도록 위치와 최대 크기를 제한함. 큰 내용은 줄바꿈·내부 스크롤로 처리함.
 * 표시·내용 크기·화면 크기·스크롤·애니메이션 변화에 맞춰 보정하며 전달된 ref와 이벤트는 유지함.
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
  const {
    children,
    className,
    contentClassName,
    direction = 'none',
    style,
    ref,
    onUpdate,
    ...rest
  } = props;
  const surfaceRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const minWidth = style?.minWidth;
  const minHeight = style?.minHeight;
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      surfaceRef.current = node;
      if (typeof ref === 'function') {
        return ref(node);
      }
      if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );
  const constrainToViewport = useCallback(() => {
    const node = surfaceRef.current;
    if (!node) {
      return;
    }
    const viewport = window.visualViewport;
    const left = (viewport?.offsetLeft ?? 0) + 16;
    const top = (viewport?.offsetTop ?? 0) + 16;
    const width = Math.max(
      0,
      (viewport?.width ??
        (document.documentElement.clientWidth || window.innerWidth)) - 32,
    );
    const height = Math.max(0, (viewport?.height ?? window.innerHeight) - 32);
    node.style.setProperty('--overlay-available-width', `${width}px`);
    node.style.setProperty('--overlay-available-height', `${height}px`);
    // 호출자의 inline·class 최소 크기를 먼저 복원한 뒤 화면 제한만 적용함.
    node.style.minWidth =
      typeof minWidth === 'number'
        ? `${minWidth}px`
        : typeof minWidth === 'string'
          ? minWidth
          : '';
    node.style.minHeight =
      typeof minHeight === 'number'
        ? `${minHeight}px`
        : typeof minHeight === 'string'
          ? minHeight
          : '';
    const computed = getComputedStyle(node);
    if (parseFloat(computed.minWidth) > width) {
      node.style.minWidth = `${width}px`;
    }
    if (parseFloat(computed.minHeight) > height) {
      node.style.minHeight = `${height}px`;
    }
    const rect = node.getBoundingClientRect();
    const baseX = rect.left - offsetRef.current.x;
    const baseY = rect.top - offsetRef.current.y;
    const x =
      Math.max(left, Math.min(baseX, left + width - rect.width)) - baseX;
    const y =
      Math.max(top, Math.min(baseY, top + height - rect.height)) - baseY;
    offsetRef.current = { x, y };
    node.style.translate = `${x}px ${y}px`;
  }, [minWidth, minHeight]);
  useLayoutEffect(() => {
    constrainToViewport();
    const observer = new ResizeObserver(constrainToViewport);
    if (surfaceRef.current) {
      observer.observe(surfaceRef.current);
    }
    window.addEventListener('resize', constrainToViewport);
    window.addEventListener('scroll', constrainToViewport, true);
    window.visualViewport?.addEventListener('resize', constrainToViewport);
    window.visualViewport?.addEventListener('scroll', constrainToViewport);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', constrainToViewport);
      window.removeEventListener('scroll', constrainToViewport, true);
      window.visualViewport?.removeEventListener('resize', constrainToViewport);
      window.visualViewport?.removeEventListener('scroll', constrainToViewport);
    };
  }, [constrainToViewport, children, className, style]);
  const shouldReduceMotion = useReducedMotion();
  const isPresent = useIsPresent();
  const hasAnimation = direction !== 'none' && !shouldReduceMotion;
  const hiddenState = { opacity: 0, ...INITIAL_OFFSET[direction] };

  return (
    <motion.div
      {...rest}
      ref={setRef}
      style={{
        ...style,
        maxWidth: `min(${typeof style?.maxWidth === 'number' ? `${style.maxWidth}px` : (style?.maxWidth ?? '100vw')}, var(--overlay-available-width, calc(100vw - 2rem)))`,
        maxHeight: `min(${typeof style?.maxHeight === 'number' ? `${style.maxHeight}px` : (style?.maxHeight ?? '100dvh')}, var(--overlay-available-height, calc(100dvh - 2rem)))`,
        overflowWrap: 'anywhere',
      }}
      onUpdate={(latest) => {
        constrainToViewport();
        onUpdate?.(latest);
      }}
      inert={!isPresent || rest.inert}
      aria-hidden={!isPresent || rest['aria-hidden']}
      className={clsx(CONTAINER_CLASS, className)}
      initial={hasAnimation ? hiddenState : false}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={hasAnimation ? hiddenState : { opacity: 1, x: 0, y: 0 }}
      transition={{ duration: hasAnimation ? 0.16 : 0, ease: 'easeOut' }}
    >
      <div
        className={clsx(CONTENT_CLASS, contentClassName)}
        style={{ overflowWrap: 'anywhere' }}
      >
        {children}
      </div>
    </motion.div>
  );
}
