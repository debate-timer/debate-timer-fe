// components/CountUp.tsx
import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

type AnimatedCounterProps = {
  to: number;
  duration?: number; // 초
  delay?: number; // 초
  className?: string;
};

export default function AnimatedCounter({
  to,
  duration = 1.2,
  delay = 0,
  className,
}: AnimatedCounterProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, to, {
      duration,
      delay,
      ease: 'easeOut',
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [to, duration, delay]);

  return <span className={className}>{value}</span>;
}
