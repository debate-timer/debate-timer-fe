import { render, renderHook, screen } from '@testing-library/react';
import { describe, expect } from 'vitest';
import useMobile from './useMobile';

function UseMobileTestComponent() {
  const isMobile = useMobile();

  return (
    <div>
      {isMobile && <h1 data-testid="mobile">Mobile</h1>}
      {!isMobile && <h1 data-testid="non-mobile">Non-mobile</h1>}
    </div>
  );
}

describe('useMobile hook', () => {
  it('Check whether hook returns true when in mobile viewport', () => {
    global.innerWidth = 720;
    const { result } = renderHook(() => useMobile());

    expect(result.current).toBe(true);
  });

  it('Check whether hook returns false when in non-mobile viewport', () => {
    global.innerWidth = 1024;
    const { result } = renderHook(() => useMobile());

    expect(result.current).toBe(false);
  });

  it('Check whether components are properly rendered in mobile viewport', () => {
    global.innerWidth = 720;
    render(<UseMobileTestComponent />);

    expect(screen.getByTestId('mobile')).toBeInTheDocument();
  });

  it('Check whether components are properly rendered in non-mobile viewport', () => {
    global.innerWidth = 1024;
    render(<UseMobileTestComponent />);

    expect(screen.getByTestId('non-mobile')).toBeInTheDocument();
  });
});
