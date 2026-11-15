import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import GlobalSettingsProvider from '../../components/GlobalSettingsProvider/GlobalSettingsProvider';
import apiDebateTableRepository from '../../repositories/ApiDebateTableRepository';
import { DebateTableData } from '../../types/type';
import { setAccessToken } from '../../util/accessToken';
import { encodeDebateTableData } from '../../util/arrayEncoding';
import { GlobalPortal } from '../../util/GlobalPortal';
import { setSessionCustomizeTableData } from '../../util/sessionStorage';
import TableSharingPage from './TableSharingPage';

const SAMPLE_TABLE: DebateTableData = {
  info: {
    name: '공유 테스트 시간표',
    agenda: '공유 테스트 주제',
    prosTeamName: '찬성',
    consTeamName: '반대',
  },
  table: [
    {
      stance: 'PROS',
      speechType: '입론',
      boxType: 'NORMAL',
      time: 60,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '1',
      bell: [{ type: 'BEFORE_END', time: 0, count: 1 }],
    },
  ],
};

function renderTableSharing(initialEntry: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/share',
        element: (
          <ErrorBoundary>
            <TableSharingPage />
          </ErrorBoundary>
        ),
      },
      { path: '/dashboard', element: <div>대시보드</div> },
      { path: '/overview/:type/:id', element: <div>개요 화면</div> },
    ],
    { initialEntries: [initialEntry] },
  );

  render(
    <QueryClientProvider client={new QueryClient()}>
      <GlobalSettingsProvider>
        <GlobalPortal.Provider>
          <RouterProvider router={router} />
        </GlobalPortal.Provider>
      </GlobalSettingsProvider>
    </QueryClientProvider>,
  );

  return router;
}

describe('테이블 공유 페이지', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('로그인 상태에서 잘못된 data로 진입하면 빈 모달 대신 오류 화면을 표시한다', async () => {
    setAccessToken('token');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderTableSharing('/share?data=invalid-data');

    await waitFor(() =>
      expect(
        screen.queryByText('데이터를 처리하고 있습니다...'),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.queryByText('공유받은 토론 시간표를 내 시간표 목록에 저장하시겠어요?'),
    ).not.toBeInTheDocument();
    spy.mockRestore();
  });

  it('로그인 상태에서 data와 게스트 데이터가 모두 없으면 대시보드로 이동한다', async () => {
    setAccessToken('token');
    const router = renderTableSharing('/share');

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/dashboard'),
    );
  });

  it('로그인 상태에서 게스트 테이블을 저장할 때 실패하면 ErrorBoundary로 오류를 전달한다', async () => {
    setAccessToken('token');
    setSessionCustomizeTableData(SAMPLE_TABLE);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(apiDebateTableRepository, 'addTable').mockRejectedValueOnce(
      new Error('network error'),
    );

    renderTableSharing('/share');

    await waitFor(() =>
      expect(
        screen.queryByText('데이터를 처리하고 있습니다...'),
      ).not.toBeInTheDocument(),
    );
    spy.mockRestore();
  });

  it('로그인 상태에서 유효한 data로 진입해 저장하기를 누르면 개요 화면으로 이동한다', async () => {
    setAccessToken('token');
    vi.spyOn(apiDebateTableRepository, 'addTable').mockResolvedValueOnce({
      id: 42,
      ...SAMPLE_TABLE,
    });
    const encoded = encodeDebateTableData(SAMPLE_TABLE);
    const router = renderTableSharing(`/share?data=${encoded}`);

    const heading = await screen.findByText(
      '공유받은 토론 시간표를 내 시간표 목록에 저장하시겠어요?',
    );
    expect(heading).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '저장하기' }));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/overview/customize/42'),
    );
  });

  it('로그인 상태에서 모달을 Escape로 닫으면 대시보드로 이동한다', async () => {
    setAccessToken('token');
    const encoded = encodeDebateTableData(SAMPLE_TABLE);
    const router = renderTableSharing(`/share?data=${encoded}`);

    const heading = await screen.findByText(
      '공유받은 토론 시간표를 내 시간표 목록에 저장하시겠어요?',
    );
    expect(heading).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/dashboard'),
    );
  });
});
