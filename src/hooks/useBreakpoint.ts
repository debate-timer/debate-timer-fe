import { useState, useEffect } from 'react';

const breakpoints = {
  md: 768,
  lg: 1280,
  xl: 1600,
} as const;

export type Breakpoint = 'default' | keyof typeof breakpoints;

export default function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('default');

  useEffect(() => {
    const handleResize = () => {
      const { innerWidth } = window;

      if (innerWidth >= breakpoints.xl) {
        setBreakpoint('xl');
      } else if (innerWidth >= breakpoints.lg) {
        setBreakpoint('lg');
      } else if (innerWidth >= breakpoints.md) {
        setBreakpoint('md');
      } else {
        setBreakpoint('default');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}
