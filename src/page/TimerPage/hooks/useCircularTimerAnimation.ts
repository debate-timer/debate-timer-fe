import { animate, useMotionValue } from 'framer-motion';
import { useEffect } from 'react';

export default function useCircularTimerAnimation(rawProgress: number) {
  const progress = Math.max(
    0,
    Math.min(100, Number.isFinite(rawProgress) ? rawProgress : 0),
  );
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
