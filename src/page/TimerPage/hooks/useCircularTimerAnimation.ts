import { animate, useMotionValue } from 'framer-motion';
import { useEffect } from 'react';

export default function useCircularTimerAnimation(rawProgress: number) {
  const progress = Math.min(100, rawProgress);
  const progressMotionValue = useMotionValue(0);

  useEffect(() => {
    animate(progressMotionValue, progress, {
      duration: 0.7,
      ease: 'easeOut',
    });
  }, [progress, progressMotionValue]);

  return progressMotionValue;
}
