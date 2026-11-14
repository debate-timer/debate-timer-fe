import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import GlobalSettingsProvider from '../components/GlobalSettingsProvider/GlobalSettingsProvider';
import { GlobalPortal } from '../util/GlobalPortal';
import { protectedAppRoutes } from './routes';
import LanguageWrapper from './LanguageWrapper';
import { server } from '../mocks/server';
import { ApiUrl } from '../apis/endpoints';
import { oAuthLogin } from '../util/googleAuth';
import { consumeLoginReturn } from '../util/loginReturn';
import i18n from '../i18n';

vi.mock('../util/googleAuth', () => ({ oAuthLogin: vi.fn() }));
vi.mock('../components/UpdateModal/UpdateModalWrapper', () => ({
  default: () => null,
}));

function renderAt(path: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createMemoryRouter(
    [
      { path: '/', element: <LanguageWrapper />, children: protectedAppRoutes },
      {
        path: ':lang',
        element: <LanguageWrapper />,
        children: protectedAppRoutes,
      },
    ],
    { initialEntries: [path] },
  );
  render(
    <QueryClientProvider client={client}>
      <GlobalSettingsProvider>
        <GlobalPortal.Provider>
          <RouterProvider router={router} />
        </GlobalPortal.Provider>
      </GlobalSettingsProvider>
    </QueryClientProvider>,
  );
  return router;
}

beforeEach(async () => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['ko-KR']);
  vi.spyOn(navigator, 'language', 'get').mockReturnValue('ko-KR');
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
  await i18n.changeLanguage('ko');
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('새 탐색 경로와 인증 연결', () => {
  it('보호 경로 직접 방문은 소개에서 확인하고 원래 목적지로 로그인한다', async () => {
    const user = userEvent.setup();
    const router = renderAt('/dashboard?sort=recent#first');
    await screen.findByRole('dialog', { name: '로그인이 필요합니다' });
    expect(router.state.location.pathname).toBe('/');
    expect(oAuthLogin).not.toHaveBeenCalled();
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '로그인',
      }),
    );
    expect(oAuthLogin).toHaveBeenCalledTimes(1);
    expect(consumeLoginReturn()).toEqual({
      path: '/dashboard?sort=recent#first',
    });
  });
  it.each([
    ['/home?from=old#intro', '/', '?from=old', '#intro'],
    ['/en/home?from=old#intro', '/en', '?from=old', '#intro'],
    ['/?tab=records&sort=recent#entry', '/records', '?sort=recent', '#entry'],
    [
      '/en/dashboard?tab=records&sort=recent#entry',
      '/en/records',
      '?sort=recent',
      '#entry',
    ],
  ])(
    '이전 링크 %s의 목적지와 나머지 URL을 보존한다',
    async (source, pathname, search, hash) => {
      localStorage.setItem('accessToken', 'test-token');
      localStorage.setItem('memberId', '1');
      const router = renderAt(source);
      await waitFor(() =>
        expect(router.state.location.pathname).toBe(pathname),
      );
      expect(router.state.location.search).toBe(search);
      expect(router.state.location.hash).toBe(hash);
      expect(router.state.historyAction).toBe('REPLACE');
    },
  );
  it('권한 없는 회원은 기록 목록을 조회하지 않고 대시보드로 이동한다', async () => {
    localStorage.setItem('accessToken', 'test-token');
    localStorage.setItem('memberId', '1');
    let recordsRequests = 0;
    server.use(
      http.get(`${ApiUrl.member}/feature-flags`, () =>
        HttpResponse.json({ featureFlags: [] }),
      ),
      http.get(ApiUrl.transcript, () => {
        recordsRequests += 1;
        return HttpResponse.json({ transcripts: [] });
      }),
    );
    const router = renderAt('/records');
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/dashboard'),
    );
    expect(recordsRequests).toBe(0);
    expect(
      screen.queryByRole('link', { name: '토론 기록' }),
    ).not.toBeInTheDocument();
  });
});
