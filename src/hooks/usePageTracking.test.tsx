import { renderHook } from '@testing-library/react';
import {
  RouterProvider,
  createMemoryRouter,
  Outlet,
} from 'react-router-dom';
import type { PropsWithChildren, ReactNode } from 'react';
import usePageTracking from './usePageTracking';
import { analyticsManager } from '../util/analytics';

vi.mock('../util/analytics', () => ({
  analyticsManager: {
    trackPageView: vi.fn(),
    trackEvent: vi.fn(),
    flush: vi.fn(),
  },
}));

function createWrapper(initialPath: string = '/home') {
  return function Wrapper({ children }: PropsWithChildren) {
    function Layout({ slot }: { slot: ReactNode }) {
      return (
        <>
          {slot}
          <Outlet />
        </>
      );
    }

    const router = createMemoryRouter(
      [
        {
          path: '*',
          element: <Layout slot={children} />,
        },
      ],
      { initialEntries: [initialPath] },
    );

    return <RouterProvider router={router} />;
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

  test('페이지에 진입하면 page_view가 한 번 기록된다', () => {
    renderHook(() => usePageTracking(), { wrapper: createWrapper() });
    expect(analyticsManager.trackPageView).toHaveBeenCalledTimes(1);
  });

  test('페이지를 떠나면 머문 시간과 함께 page_leave가 기록된다', () => {
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

  test('page_leave의 duration_ms는 실제로 머문 시간을 반영한다', () => {
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
