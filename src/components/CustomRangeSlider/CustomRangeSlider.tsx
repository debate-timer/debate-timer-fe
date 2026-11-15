import { PointerEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface CustomRangeSliderProps {
  // Controlled props
  value: number;
  onValueChange: (value: number) => void;
  onValueCommit?: () => void;
  ariaLabel?: string;

  // Configuration
  min?: number;
  max?: number;
  step?: number;
}

const THUMB_BASE_CLASS =
  'pointer-events-none absolute top-1/2 size-[12px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand shadow-md transition-[scale] duration-100 motion-reduce:transition-none peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-neutral-900';

/**
 * 값에 따른 길이·위치는 즉시 반영하고 확대 효과만 100ms로 전환함. 움직임 감소 설정에서는 전환을 끔.
 * 터치는 트랙 좌표를 min·max·step에 맞춰 값으로 변환하고 포인터 캡처로 영역 밖 이동까지 추적함.
 * 슬라이더 위의 터치는 화면 스크롤 대신 값 조절에 사용하며 마우스·키보드는 기본 range 조작을 유지함.
 * 값 보정·터치 툴팁·중복 커밋 방지를 제공함.
 */
export default function CustomRangeSlider(props: CustomRangeSliderProps) {
  const {
    value,
    onValueChange,
    onValueCommit,
    ariaLabel,
    min = 0,
    max = 100,
    step = 1,
  } = props;
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const hasUncommittedChangeRef = useRef(false);
  const activeTouchIdRef = useRef<number | null>(null);

  const safeMax = Math.max(min, max);
  const safeStep = step > 0 ? step : 1;
  const clampedValue = Number.isFinite(value)
    ? Math.min(safeMax, Math.max(min, value))
    : min;
  const range = safeMax - min;
  const percentage = range <= 0 ? 0 : ((clampedValue - min) / range) * 100;
  const isTooltipVisible = isHovered || isFocused || isDragging;

  const commitValue = () => {
    if (!hasUncommittedChangeRef.current) {
      return;
    }
    hasUncommittedChangeRef.current = false;
    onValueCommit?.();
  };

  const updateTouchValue = (event: PointerEvent<HTMLInputElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) {
      return;
    }
    const ratio = Math.min(
      1,
      Math.max(0, (event.clientX - rect.left) / rect.width),
    );
    const stepped = min + Math.round((ratio * range) / safeStep) * safeStep;
    const next = Number(Math.min(safeMax, Math.max(min, stepped)).toFixed(10));
    if (next !== clampedValue) {
      hasUncommittedChangeRef.current = true;
      onValueChange(next);
    }
  };

  return (
    <div className="relative mx-4 flex h-6 w-full items-center">
      {/* 실제 상호작용 레이어 */}
      <input
        type="range"
        aria-label={ariaLabel ?? t('범위 조절')}
        title={String(clampedValue)}
        min={min}
        max={safeMax}
        step={safeStep}
        value={clampedValue}
        onPointerDown={(event) => {
          if (event.isPrimary === false || activeTouchIdRef.current !== null) {
            return;
          }
          setIsDragging(true);
          if (event.pointerType === 'touch') {
            event.preventDefault();
            activeTouchIdRef.current = event.pointerId;
            event.currentTarget.focus({ preventScroll: true });
            event.currentTarget.setPointerCapture?.(event.pointerId);
            updateTouchValue(event);
          }
        }}
        onPointerMove={(event) => {
          if (activeTouchIdRef.current === event.pointerId) {
            updateTouchValue(event);
          }
        }}
        onPointerUp={(event) => {
          if (activeTouchIdRef.current !== null) {
            if (activeTouchIdRef.current !== event.pointerId) {
              return;
            }
            updateTouchValue(event);
            activeTouchIdRef.current = null;
            if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }
          setIsDragging(false);
          commitValue();
        }}
        onPointerCancel={(event) => {
          if (
            activeTouchIdRef.current !== null &&
            activeTouchIdRef.current !== event.pointerId
          ) {
            return;
          }
          activeTouchIdRef.current = null;
          setIsDragging(false);
          commitValue();
        }}
        onLostPointerCapture={() => {
          if (activeTouchIdRef.current !== null) {
            activeTouchIdRef.current = null;
            setIsDragging(false);
            commitValue();
          }
        }}
        onKeyUp={commitValue}
        onChange={(event) => {
          hasUncommittedChangeRef.current = true;
          onValueChange(Number(event.target.value));
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          commitValue();
        }}
        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer touch-none opacity-0"
      />

      {/* 스타일링 레이어 */}
      {/* 1. 전체 트랙 (배경) */}
      <div
        aria-hidden="true"
        className="absolute h-[8px] w-full rounded-full bg-brand/40"
      />

      {/* 2. 현재 진행도 트랙 */}
      <div
        aria-hidden="true"
        className="absolute h-[8px] rounded-full bg-brand"
        style={{ width: `${percentage}%` }}
      />

      {/* 3. Thumb (원형 드래그 핸들) */}
      <div
        aria-hidden="true"
        className={clsx(
          THUMB_BASE_CLASS,
          (isHovered || isDragging) && 'scale-105',
        )}
        style={{ left: `${percentage}%` }}
      >
        {/* 볼륨 수치로 나타내는 말풍선 */}
        {isTooltipVisible && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 transform">
            <div className="relative rounded-sm bg-gray-800 px-2 py-1 text-xs text-white shadow-lg">
              {clampedValue}
              {/* 말풍선 꼬리 */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-t-4 border-r-4 border-l-4 border-t-gray-800 border-r-transparent border-l-transparent" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
