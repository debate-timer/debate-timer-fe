import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PropsWithChildren } from 'react';
import usePageTracking from './usePageTracking';
import { analyticsManager } from '../util/analytics';

vi.mock('../util/analytics', () => ({
  analyticsManager: {
    trackPageView: vi.fn(),
    trackEvent: vi.fn(),
    flush: vi.fn(),
  },
}));

function createWrapper(initialEntries: string[] = ['/home']) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    );
  };
}

describe('usePageTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('마운트 시 page_view 이벤트가 발생한다', () => {
    renderHook(() => usePageTracking(), { wrapper: createWrapper() });
    expect(analyticsManager.trackPageView).toHaveBeenCalledTimes(1);
  });

  test('언마운트 시 page_leave 이벤트가 발생한다', () => {
    const { unmount } = renderHook(() => usePageTracking(), {
      wrapper: createWrapper(),
    });

    vi.advanceTimersByTime(500);
    unmount();

    expect(analyticsManager.trackEvent).toHaveBeenCalledWith(
      'page_leave',
      expect.objectContaining({
        duration_ms: expect.any(Number),
      }),
    );
  });

  test('duration_ms가 진입 시각부터 이탈 시각까지의 차이이다', () => {
    const { unmount } = renderHook(() => usePageTracking(), {
      wrapper: createWrapper(),
    });

    vi.advanceTimersByTime(100);
    unmount();

    const call = vi.mocked(analyticsManager.trackEvent).mock.calls[0];
    const properties = call[1] as { duration_ms: number };
    expect(properties.duration_ms).toBeGreaterThanOrEqual(100);
  });
});
