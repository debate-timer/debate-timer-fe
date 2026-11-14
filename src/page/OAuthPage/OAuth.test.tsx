import GlobalSettingsProvider from '../../components/GlobalSettingsProvider/GlobalSettingsProvider';
import { GlobalPortal } from '../../util/GlobalPortal';
import { saveLoginReturn } from '../../util/loginReturn';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import OAuth from './OAuth';
import { server } from '../../mocks/server';
import { ApiUrl } from '../../apis/endpoints';

let postUserCount = 0;

function useLoginResponse(status: 201 | 400) {
  server.use(
    http.post(ApiUrl.member, () => {
      postUserCount += 1;
      if (status === 400) {
        return HttpResponse.json({ message: 'invalid_grant' }, { status });
      }
      return HttpResponse.json(
        { id: 1, nickname: '홍길동' },
        { status, headers: { Authorization: 'Bearer test-token' } },
      );
    }),
  );
}

// 앱과 같이 실패한 mutation을 화면 밖으로 던지는 설정에서 렌더함
function renderOAuth(search = '?code=used-once') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { throwOnError: true, retry: false },
      mutations: { throwOnError: true },
    },
  });
  const router = createMemoryRouter(
    [
      { path: '/oauth', element: <OAuth /> },
      { path: '/dashboard', element: <h1>대시보드</h1> },
      { path: '/', element: <div>메인</div> },
      { path: '/live/12/end', element: <div>청중 복귀</div> },
      { path: '/share', element: <div>시간표 저장</div> },
    ],
    { initialEntries: ['/', `/oauth${search}`], initialIndex: 1 },
  );

  render(
    <QueryClientProvider client={queryClient}>
      <GlobalSettingsProvider>
        <GlobalPortal.Provider>
          <RouterProvider router={router} />
        </GlobalPortal.Provider>
      </GlobalSettingsProvider>
    </QueryClientProvider>,
  );

  return router;
}

describe('Google 로그인 콜백', () => {
  beforeEach(() => {
    postUserCount = 0;
    localStorage.removeItem('accessToken');
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('memberId');
    sessionStorage.clear();
  });

  it('임시 저장소가 차단되어도 로그인 후 기본 대시보드로 이동한다', async () => {
    useLoginResponse(201);
    const originalGet = Storage.prototype.getItem;
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (
      this: Storage,
      key: string,
    ) {
      if (this === sessionStorage) {
        throw new Error('blocked');
      }
      return originalGet.call(this, key);
    });
    renderOAuth();
    expect(
      await screen.findByRole('heading', { name: '대시보드' }),
    ).toBeInTheDocument();
    expect(postUserCount).toBe(1);
  });

  it('로그인에 성공하면 뒤로가기로 돌아오지 않도록 콜백 주소를 기록에서 바꿔 이동한다', async () => {
    useLoginResponse(201);
    const router = renderOAuth();

    expect(
      await screen.findByRole('heading', { name: '대시보드' }),
    ).toBeInTheDocument();
    expect(router.state.historyAction).toBe('REPLACE');
    expect(postUserCount).toBe(1);
  });

  it('청중 경로와 실제 수신 사유를 한 번 복원한다', async () => {
    useLoginResponse(201);
    saveLoginReturn({
      path: '/live/12/end?from=login#done',
      termination: { tableId: 12, reason: 'ABORT' },
    });
    const router = renderOAuth();
    await screen.findByText('청중 복귀');
    expect(router.state.location.search).toBe('?from=login');
    expect(router.state.location.hash).toBe('#done');
    expect(router.state.location.state).toEqual({
      audienceTermination: { tableId: 12, reason: 'ABORT' },
    });
    expect(sessionStorage.getItem('login-return')).toBeNull();
  });

  it('이미 로그인한 상태로 콜백 주소에 들어오면 로그인 요청 없이 이동한다', async () => {
    useLoginResponse(201);
    localStorage.setItem('accessToken', 'existing-token');
    const router = renderOAuth();

    expect(
      await screen.findByRole('heading', { name: '대시보드' }),
    ).toBeInTheDocument();
    expect(router.state.historyAction).toBe('REPLACE');
    expect(postUserCount).toBe(0);
  });

  it('이미 보낸 인가 코드로 다시 들어오면 같은 코드를 또 보내지 않는다', async () => {
    useLoginResponse(400);
    sessionStorage.setItem('oauthUsedCode', 'used-once');
    const router = renderOAuth();

    expect(await screen.findByText('메인')).toBeInTheDocument();
    expect(router.state.historyAction).toBe('REPLACE');
    expect(postUserCount).toBe(0);
  });

  it('로그인 요청이 실패하면 오류 화면 대신 메인으로 이동하고 같은 코드를 다시 보내지 않는다', async () => {
    useLoginResponse(400);
    const router = renderOAuth();

    expect(await screen.findByText('메인')).toBeInTheDocument();
    expect(router.state.historyAction).toBe('REPLACE');
    await waitFor(() => expect(postUserCount).toBe(1));
    expect(sessionStorage.getItem('oauthUsedCode')).toBe('used-once');
  });
});
