import { act, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { ApiUrl } from '../apis/endpoints';
import {
  appendUtterance,
  getSubmittedTranscriptId,
  markTranscriptDraftEnded,
  startTranscriptDraft,
} from '../util/transcriptDraft';
import RootLayout from './RootLayout';

vi.mock('../components/ErrorBoundary/ErrorBoundaryWrapper', () => ({
  default: () => <Outlet />,
}));

describe('앱 루트 레이아웃', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it('다른 페이지로 이동하면 스크롤을 맨 위로 올린다', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const router = createMemoryRouter(
      [
        {
          element: <RootLayout />,
          children: [
            { path: '/', element: <div>메인</div> },
            { path: '/templates', element: <div>템플릿</div> },
          ],
        },
      ],
      { initialEntries: ['/'] },
    );
    render(<RouterProvider router={router} />);
    scrollTo.mockClear();

    await act(() => router.navigate('/templates'));

    expect(await screen.findByText('템플릿')).toBeInTheDocument();
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('어느 화면에서든 끝낸 토론 기록을 제출한다', async () => {
    startTranscriptDraft(5, 1000);
    appendUtterance(
      5,
      { id: 's1', timeBoxIndex: 0, team: null },
      '찬성 입론',
      2000,
    );
    markTranscriptDraftEnded(5, 5000);
    server.use(
      http.post(`${ApiUrl.transcript}/:tableId`, () =>
        HttpResponse.json({ id: 21 }, { status: 201 }),
      ),
    );
    const router = createMemoryRouter(
      [
        {
          element: <RootLayout />,
          children: [{ path: '/overview', element: <div>시간표</div> }],
        },
      ],
      { initialEntries: ['/overview'] },
    );

    render(<RouterProvider router={router} />);

    expect(await screen.findByText('시간표')).toBeInTheDocument();
    await waitFor(() => expect(getSubmittedTranscriptId(5)).toBe(21));
  });
});
