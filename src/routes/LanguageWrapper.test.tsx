import { render, screen, waitFor, cleanup, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import LanguageWrapper from './LanguageWrapper';
import useGlobalSettings from '../hooks/useGlobalSettings';
import GlobalSettingsProvider from '../components/GlobalSettingsProvider/GlobalSettingsProvider';
import { server } from '../mocks/server';
import { ApiUrl } from '../apis/endpoints';
import { setAccessToken, setMemberId } from '../util/accessToken';
vi.mock('../hooks/usePageTracking', () => ({ default: () => {} }));
vi.mock('../i18n', () => ({
  default: { changeLanguage: vi.fn(), language: 'ko' },
}));
let change: ReturnType<typeof useGlobalSettings>['controller'];

function Consumer() {
  const settings = useGlobalSettings();
  change = settings.controller;
  const location = useLocation();
  return (
    <div>
      {location.pathname}
      {location.search}
      {location.hash}
    </div>
  );
}
function start(path: string) {
  const client = new QueryClient();
  const router = createMemoryRouter(
    [
      {
        element: <LanguageWrapper />,
        children: [{ path: '*', element: <Consumer /> }],
      },
    ],
    { initialEntries: [path] },
  );
  render(
    <QueryClientProvider client={client}>
      <GlobalSettingsProvider>
        <RouterProvider router={router} />
      </GlobalSettingsProvider>
    </QueryClientProvider>,
  );
  return router;
}
afterEach(() => {
  cleanup();
  localStorage.clear();
});
describe('설정 언어와 URL', () => {
  it('명시 영어 링크는 저장된 한국어보다 우선하며 query와 hash를 보존한다', async () => {
    localStorage.setItem('guest-settings-language', 'ko');
    start('/en/home?q=1#section');
    await waitFor(() => expect(document.documentElement.lang).toBe('en'));
    expect(screen.getByText('/en/home?q=1#section')).toBeInTheDocument();
    expect(localStorage.getItem('guest-settings-language')).toBe('ko');
  });
  it('명시 한국어를 정규화한 뒤 늦은 영어 계정 응답에도 유지한다', async () => {
    setAccessToken('a');
    setMemberId(1);
    server.use(
      http.get(`${ApiUrl.member}/settings`, () =>
        HttpResponse.json({ language: 'en', volume: 0.8 }),
      ),
    );
    start('/ko/home?q=1#section');
    await waitFor(() =>
      expect(screen.getByText('/home?q=1#section')).toBeInTheDocument(),
    );
    expect(document.documentElement.lang).toBe('ko');
  });
  it('표시와 다른 저장값을 직접 고르면 링크 우선값을 대체한다', async () => {
    localStorage.setItem('guest-settings-language', 'ko');
    start('/en/home');
    await waitFor(() => expect(document.documentElement.lang).toBe('en'));
    await act(async () => {
      change.change({ language: 'ko' });
      await change.flush();
    });
    await waitFor(() => expect(screen.getByText('/home')).toBeInTheDocument());
    expect(document.documentElement.lang).toBe('ko');
  });
});
