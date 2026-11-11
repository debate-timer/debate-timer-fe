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
      { path: '/', element: <div>대시보드</div> },
      { path: '/home', element: <div>메인</div> },
    ],
    { initialEntries: ['/home', `/oauth${search}`], initialIndex: 1 },
  );

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('memberId');
    sessionStorage.clear();
  });

  it('로그인에 성공하면 뒤로가기로 돌아오지 않도록 콜백 주소를 기록에서 바꿔 이동한다', async () => {
    useLoginResponse(201);
    const router = renderOAuth();

    expect(await screen.findByText('대시보드')).toBeInTheDocument();
    expect(router.state.historyAction).toBe('REPLACE');
    expect(postUserCount).toBe(1);
  });

  it('이미 로그인한 상태로 콜백 주소에 들어오면 로그인 요청 없이 이동한다', async () => {
    useLoginResponse(201);
    localStorage.setItem('accessToken', 'existing-token');
    const router = renderOAuth();

    expect(await screen.findByText('대시보드')).toBeInTheDocument();
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
