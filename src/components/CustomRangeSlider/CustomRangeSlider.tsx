import { useState } from 'react';

interface CustomRangeSliderProps {
  // Controlled props
  value: number;
  onValueChange: (value: number) => void;

  // Configuration
  min?: number;
  max?: number;
  step?: number;
}

export default function CustomRangeSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
}: CustomRangeSliderProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const percentage = Math.min(
    100,
    Math.max(0, ((value - min) / (max - min)) * 100),
  );

  return (
    <div className="relative mx-4 flex h-6 w-full items-center">
      {/* 스타일링 레이어 */}
      {/* 1. 전체 트랙 (배경) */}
      <div className={`absolute h-[8px] w-full rounded-full bg-brand/40`} />

      {/* 2. 현재 진행도 트랙 */}
      <div
        className={`absolute h-[8px] rounded-full bg-brand transition-all`}
        style={{ width: `${percentage}%` }}
      />

      {/* 3. Thumb (원형 드래그 핸들) */}
      <div
        className={`pointer-events-none absolute top-1/2 size-[12px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand shadow-md transition-all hover:scale-105`}
        title={value.toString()}
        style={{ left: `${percentage}%` }}
      >
        {/* 볼륨 수치로 나타내는 말풍선 */}
        {showTooltip && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 transform">
            <div className="relative rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-lg">
              {value}
              {/* 말풍선 꼬리 */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
            </div>
          </div>
        )}
      </div>

      {/* 실제 상호작용 레이어 */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange(Number(e.target.value))}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
}
