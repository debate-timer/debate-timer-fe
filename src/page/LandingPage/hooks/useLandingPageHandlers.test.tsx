import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import useLandingPageHandlers from './useLandingPageHandlers';
import { isLoggedIn } from '../../../util/accessToken';
import { oAuthLogin } from '../../../util/googleAuth';
import { analyticsManager } from '../../../util/analytics';
import { setLoginTrigger } from '../../../util/analytics/loginTrigger';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => mockNavigate,
}));
vi.mock('../../../util/accessToken', () => ({ isLoggedIn: vi.fn() }));
vi.mock('../../../util/googleAuth', () => ({ oAuthLogin: vi.fn() }));
vi.mock('../../../util/analytics', () => ({
  analyticsManager: { trackEvent: vi.fn() },
}));
vi.mock('../../../util/analytics/loginTrigger', () => ({
  setLoginTrigger: vi.fn(),
}));

function Wrapper({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('랜딩 페이지 로그인 시작', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(['landing_hero', 'landing_closing_cta'] as const)(
    '비로그인 상태에서 %s 위치를 기록하고 로그인을 시작한다',
    (triggerContext) => {
      vi.mocked(isLoggedIn).mockReturnValue(false);
      const { result } = renderHook(() => useLandingPageHandlers(), {
        wrapper: Wrapper,
      });

      act(() => result.current.handleLoginStart(triggerContext));

      const expected = {
        trigger_page: '/',
        trigger_context: triggerContext,
      };
      expect(analyticsManager.trackEvent).toHaveBeenCalledWith(
        'login_started',
        expected,
      );
      expect(setLoginTrigger).toHaveBeenCalledWith(expected);
      expect(oAuthLogin).toHaveBeenCalledTimes(1);
    },
  );

  it('로그인 상태이면 기록 없이 대시보드로 이동한다', () => {
    vi.mocked(isLoggedIn).mockReturnValue(true);
    const { result } = renderHook(() => useLandingPageHandlers(), {
      wrapper: Wrapper,
    });

    act(() => result.current.handleLoginStart('landing_hero'));

    expect(analyticsManager.trackEvent).not.toHaveBeenCalled();
    expect(oAuthLogin).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
