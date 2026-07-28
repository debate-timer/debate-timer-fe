import clsx from 'clsx';
import {
  animate,
  clamp,
  motion,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { useEffect } from 'react';

export type TimerProgressBarTeam = 'PROS' | 'CONS' | 'DISABLED';

interface TimerProgressBarProps {
  progress: number;
  team: TimerProgressBarTeam;
  isRunning: boolean;
  className?: string;
}

const TEAM_COLOR_CLASS: Record<TimerProgressBarTeam, string> = {
  PROS: 'bg-camp-blue',
  CONS: 'bg-camp-red',
  DISABLED: 'bg-default-neutral',
};

export default function TimerProgressBar({
  progress,
  team,
  isRunning,
  className,
}: TimerProgressBarProps) {
  const normalizedProgress = clamp(0, 100, progress);
  const progressMotionValue = useMotionValue(normalizedProgress);
  const width = useTransform(
    progressMotionValue,
    (currentProgress) => `${currentProgress}%`,
  );

  useEffect(() => {
    const controls = animate(progressMotionValue, normalizedProgress, {
      duration: isRunning ? 0.7 : 0,
      ease: 'easeOut',
    });

    return () => controls.stop();
  }, [isRunning, normalizedProgress, progressMotionValue]);

  return (
    <div
      className={clsx(
        'h-[24px] w-full overflow-hidden rounded-full bg-default-disabled/hover',
        className,
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalizedProgress}
    >
      <motion.div
        className={clsx('h-full rounded-full', TEAM_COLOR_CLASS[team])}
        data-testid="timer-progress-fill"
        style={{ width }}
      />
    </div>
  );
}
