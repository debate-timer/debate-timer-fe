import { type PropsWithChildren } from 'react';
import { Stance, TimeBoxType } from '../../../type/type';
import { MotionValue, useTransform, motion } from 'framer-motion';

/**
 * CircularTimer 컴포넌트의 Props 정의
 * @property {number} progress - 타이머의 진행률 (0 ~ 100 사이의 값).
 * @property {number} [strokeWidth=15] - 테두리의 두께 (px).
 */
interface CircularTimerProps {
  progress: MotionValue<number>;
  stance: Stance;
  boxType?: TimeBoxType;
  strokeWidth?: number;
  className?: string;
}

export default function CircularTimer({
  progress,
  strokeWidth = 15,
  stance,
  boxType,
  className = 'w-[480px] h-[480px]',
  children,
}: PropsWithChildren<CircularTimerProps>) {
  const BASE_COLOR = '#D6D7D9'; // bg-default-disabled/hover
  const PROGRESS_COLOR =
    boxType === 'FEEDBACK'
      ? '#FECD4C' // bg-brand
      : stance === 'NEUTRAL'
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
  const strokeGap = `${strokeWidth * 2}px`;

  return (
    <motion.div
      className={`relative grid place-items-center rounded-full transition-all duration-300 ease-in-out ${className}`}
      style={{
        backgroundImage,
      }}
    >
      <div
        className="absolute grid place-items-center rounded-full bg-default-white"
        style={{
          width: `calc(100% - ${strokeGap})`,
          height: `calc(100% - ${strokeGap})`,
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
