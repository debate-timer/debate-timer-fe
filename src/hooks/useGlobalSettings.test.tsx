import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { StrictMode, PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import useGlobalSettings from './useGlobalSettings';
import GlobalSettingsProvider from '../components/GlobalSettingsProvider/GlobalSettingsProvider';
import { server } from '../mocks/server';
import { ApiUrl } from '../apis/endpoints';
import {
  setAccessToken,
  setMemberId,
  removeAccessToken,
  removeMemberId,
} from '../util/accessToken';

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper(props: PropsWithChildren) {
    return (
      <StrictMode>
        <QueryClientProvider client={client}>
          <GlobalSettingsProvider>{props.children}</GlobalSettingsProvider>
        </QueryClientProvider>
      </StrictMode>
    );
  };
}
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
describe('전역 설정 상태 연결', () => {
  it('비회원 음량을 읽고 직접 변경만 저장한다', async () => {
    localStorage.setItem('timer-volume', '0.24');
    const { result } = renderHook(useGlobalSettings, {
      wrapper: createWrapper(),
    });
    expect(result.current.volume).toBe(0.2);
    await act(async () => {
      result.current.controller.change({ language: 'en' });
      await result.current.controller.flush();
    });
    expect(localStorage.getItem('guest-settings-language')).toBe('en');
    expect(localStorage.getItem('timer-volume')).toBe('0.24');
  });
  it('로그인과 로그아웃 때 회원값과 원래 비회원값을 분리한다', async () => {
    localStorage.setItem('timer-volume', '0.2');
    server.use(
      http.get(`${ApiUrl.member}/settings`, () =>
        HttpResponse.json({ language: 'en', volume: 0.8 }),
      ),
    );
    const { result } = renderHook(useGlobalSettings, {
      wrapper: createWrapper(),
    });
    act(() => {
      setAccessToken('member-a');
      setMemberId(1);
    });
    await waitFor(() => expect(result.current.volume).toBe(0.8));
    act(() => {
      removeAccessToken();
      removeMemberId();
    });
    await waitFor(() => expect(result.current.volume).toBe(0.2));
    expect(result.current.language).toBe(null);
  });
  it('초기 조회 실패에도 직접 변경한 필드만 저장한다', async () => {
    setAccessToken('member-a');
    setMemberId(1);
    const bodies: unknown[] = [];
    server.use(
      http.get(
        `${ApiUrl.member}/settings`,
        () => new HttpResponse(null, { status: 500 }),
      ),
      http.patch(`${ApiUrl.member}/settings`, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json({ language: 'en', volume: 0.3 });
      }),
    );
    const { result } = renderHook(useGlobalSettings, {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.loadStatus).toBe('error'));
    await act(async () => {
      result.current.controller.change({ language: 'en' });
      await result.current.controller.flush();
    });
    expect(bodies).toEqual([{ language: 'en' }]);
    expect(result.current.volume).toBe(0.3);
  });
  it('저장소 실패에도 적용값과 수동 재시도를 유지한다', async () => {
    const { result } = renderHook(useGlobalSettings, {
      wrapper: createWrapper(),
    });
    const spy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('blocked');
      });
    await act(async () => {
      result.current.controller.change({ volume: 0.9 });
      await result.current.controller.flush();
    });
    expect(result.current.status).toBe('error');
    expect(result.current.volume).toBe(0.9);
    spy.mockRestore();
    await act(async () => {
      await result.current.controller.retry();
    });
    expect(localStorage.getItem('timer-volume')).toBe('0.9');
  });
});

it('설정이 미저장이거나 실패해도 페이지 종료를 막지 않는다', async () => {
  const { result } = renderHook(useGlobalSettings, {
    wrapper: createWrapper(),
  });
  act(() => result.current.controller.change({ volume: 0.8 }));
  const pending = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(pending);
  expect(pending.defaultPrevented).toBe(false);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  await act(async () => {
    await result.current.controller.flush();
  });
  const failed = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(failed);
  expect(failed.defaultPrevented).toBe(false);
});
