import { animate, clamp, useMotionValue } from 'framer-motion';
import { useEffect } from 'react';

export default function useCircularTimerAnimation(rawProgress: number) {
  const progress = clamp(0, 100, rawProgress);
  const progressMotionValue = useMotionValue(0);

  useEffect(() => {
    const controls = animate(progressMotionValue, progress, {
      duration: 0.7,
      ease: 'easeOut',
    });

    return () => controls.stop();
  }, [progress, progressMotionValue]);

  return progressMotionValue;
}
