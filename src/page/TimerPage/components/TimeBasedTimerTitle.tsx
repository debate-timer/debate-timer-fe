import React, { PropsWithChildren } from 'react';

interface TimeBasedTimerTitleProps extends PropsWithChildren {
  width?: number;
  height?: number;
  className?: string;
}

export default function TimeBasedTimerTitle({
  children,
  width = 320,
  height = 60,
  className,
}: TimeBasedTimerTitleProps) {
  return (
    <div
      className={`relative inline-block ${className || ''}`}
      style={{ width, height }}
    >
      <div className="absolute h-full w-full">
        <SvgShape width={width} height={height} />
      </div>

      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center pl-4 pr-7">
        {children}
      </div>
    </div>
  );
}

const SvgShape: React.FC<{ width: number; height: number }> = ({
  width,
  height,
}) => {
  const pathData = `
    M0 4.875
    C0 2.666, 1.791 0.875, 4 0.875 H${width - 4.131}
    C${width - 0.811} 0.875, ${width + 1.064} 4.686, ${width - 0.962} 7.316
    L${width - 17.231} 28.434 C${width - 18.339} 29.873, ${width - 18.339} 31.878, ${width - 17.231} 33.317
    L${width - 0.962} 54.434 C${width + 1.064} 57.064, ${width - 0.811} 60.875, ${width - 4.131} 60.875
    H4 C1.791 60.875, 0 59.085, 0 56.875 V4.875 Z
  `;
  const gradientId = `grad_${Math.random()}`;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={pathData} fill={`url(#${gradientId})`} />
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFE7A8" />
          <stop offset="0.322" stopColor="#FFDD85" />
          <stop offset="1" stopColor="#FECD4C" />
        </linearGradient>
      </defs>
    </svg>
  );
};
