import { type PropsWithChildren } from 'react';
import { Stance } from '../../../type/type';
import { MotionValue, useTransform, motion } from 'framer-motion';

/**
 * CircularTimer 컴포넌트의 Props 정의
 * @property {number} progress - 타이머의 진행률 (0 ~ 100 사이의 값).
 * @property {number} [size=200] - 컴포넌트의 전체 지름 (px).
 * @property {number} [strokeWidth=15] - 테두리의 두께 (px).
 */
interface CircularTimerProps {
  progress: MotionValue<number>;
  size?: number;
  strokeWidth?: number;
  stance: Stance;
}

export default function CircularTimer({
  progress,
  size = 200,
  strokeWidth = 15,
  stance,
  children,
}: PropsWithChildren<CircularTimerProps>) {
  const BASE_COLOR = '#D6D7D9'; // bg-default-disabled/hover
  const PROGRESS_COLOR =
    stance === 'NEUTRAL'
      ? '#A3A3A3' // bg-default-neutral
      : stance === 'PROS'
        ? '#1E91D6' // bg-camp-blue
        : '#E14666'; // bg-camp-red
  const angle = useTransform(progress, [0, 100], [0, 360]);
  const backgroundImage = useTransform(angle, (currentAngle) => {
    if (currentAngle >= 360) {
      return `conic-gradient(${BASE_COLOR})`;
    } else if (currentAngle <= 0) {
      return `conic-gradient(${PROGRESS_COLOR})`;
    } else {
      return `conic-gradient(from 0deg, ${BASE_COLOR} ${currentAngle}deg, ${PROGRESS_COLOR} ${currentAngle}deg 360deg)`;
    }
  });
  console.log(`# angle = ${angle}`);

  return (
    <motion.div
      className="relative grid place-items-center rounded-full transition-all duration-500 ease-linear"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundImage,
      }}
    >
      <div
        className="absolute grid place-items-center rounded-full bg-default-white"
        style={{
          width: `${size - strokeWidth * 2}px`,
          height: `${size - strokeWidth * 2}px`,
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
