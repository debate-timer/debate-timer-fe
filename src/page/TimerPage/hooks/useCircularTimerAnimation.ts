import { animate, clamp, useMotionValue } from 'framer-motion';
import { useEffect } from 'react';

export default function useCircularTimerAnimation(
  rawProgress: number,
  isRunning: boolean,
) {
  const progress = clamp(0, 100, rawProgress);
  const progressMotionValue = useMotionValue(0);

  useEffect(() => {
    const controls = animate(progressMotionValue, progress, {
      duration: isRunning ? 0.7 : 0,
      ease: 'easeOut',
    });

    return () => controls.stop();
  }, [progress, progressMotionValue, isRunning]);

  return progressMotionValue;
}
