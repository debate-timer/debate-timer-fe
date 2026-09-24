import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GlobalPortal } from '../../util/GlobalPortal';
import TableOverviewPage from './TableOverviewPage';
import TableSharingPage from '../TableSharingPage/TableSharingPage';
import { encodeDebateTableData } from '../../util/arrayEncoding';
import { server } from '../../mocks/server';
import { DebateTableData } from '../../type/type';
import { SAMPLE_TABLE_DATA } from '../../constants/sample_table';

const sharedTable: DebateTableData = {
  info: {
    name: '공유받은 테이블',
    agenda: '공유 주제',
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
      bell: [{ type: 'BEFORE_END', time: 0, count: 2 }],
    },
  ],
};

function renderWithRouter(initialEntry: string) {
  const router = createMemoryRouter(
    [
      { path: '/share', element: <TableSharingPage /> },
      { path: '/overview/:type/:id', element: <TableOverviewPage /> },
      { path: '/home', element: <div>HOME</div> },
    ],
    { initialEntries: [initialEntry] },
  );

  render(
    <QueryClientProvider client={new QueryClient()}>
      <GlobalPortal.Provider>
        <RouterProvider router={router} />
      </GlobalPortal.Provider>
    </QueryClientProvider>,
  );

  return router;
}

describe('비회원 테이블 개요 페이지 - 세션 데이터 유실', () => {
  const requestedUrls: string[] = [];
  const onRequestStart = ({ request }: { request: Request }) => {
    requestedUrls.push(request.url);
  };

  beforeEach(() => {
    sessionStorage.clear();
    requestedUrls.length = 0;
    server.events.on('request:start', onRequestStart);
  });

  afterEach(() => {
    server.events.removeListener('request:start', onRequestStart);
  });

  it('공유 링크 -> 개요 -> 홈 -> 뒤로가기 시 NaN 조회 없이 샘플 테이블로 복구한다', async () => {
    const router = renderWithRouter(
      `/share?data=${encodeURIComponent(encodeDebateTableData(sharedTable))}`,
    );

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/overview/customize/guest'),
    );
    await screen.findByText('공유받은 테이블');

    // 헤더 홈 버튼은 게스트 세션 데이터를 삭제한다.
    await userEvent.click(screen.getAllByLabelText('홈으로 이동')[0]);
    await waitFor(() => expect(router.state.location.pathname).toBe('/home'));
    expect(sessionStorage.getItem('DebateTableData')).toBeNull();

    await act(async () => {
      await router.navigate(-1);
    });
    expect(router.state.location.pathname).toBe('/overview/customize/guest');

    await screen.findByText(SAMPLE_TABLE_DATA.info.name);
    expect(sessionStorage.getItem('DebateTableData')).not.toBeNull();
    expect(requestedUrls.filter((url) => url.includes('NaN'))).toEqual([]);
  });

  it('세션 데이터 없이 게스트 경로로 직접 진입해도 샘플 테이블을 보여준다', async () => {
    renderWithRouter('/overview/customize/guest');

    await screen.findByText(SAMPLE_TABLE_DATA.info.name);
    expect(requestedUrls.filter((url) => url.includes('NaN'))).toEqual([]);
  });

  it('세션에 게스트 데이터가 있으면 덮어쓰지 않는다', async () => {
    sessionStorage.setItem(
      'DebateTableData',
      JSON.stringify({ id: -1, ...sharedTable }),
    );
    renderWithRouter('/overview/customize/guest');

    await screen.findByText('공유받은 테이블');
    expect(screen.queryByText(SAMPLE_TABLE_DATA.info.name)).toBeNull();
  });
});
