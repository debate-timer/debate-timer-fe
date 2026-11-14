import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import GlobalSettingsProvider from '../../components/GlobalSettingsProvider/GlobalSettingsProvider';
import { GlobalPortal } from '../../util/GlobalPortal';
import { server } from '../../mocks/server';
import { ApiUrl } from '../../apis/endpoints';
import VoteCompletePage from './VoteCompletePage';

function renderAt(path: string, client = new QueryClient()) {
  return render(
    <QueryClientProvider client={client}>
      <GlobalSettingsProvider>
        <GlobalPortal.Provider>
          <MemoryRouter initialEntries={[path]}>
            <VoteCompletePage />
          </MemoryRouter>
        </GlobalPortal.Provider>
      </GlobalSettingsProvider>
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
afterEach(cleanup);

describe('투표 완료 헤더', () => {
  it('참여 때의 캐시 정보로 완료 안내를 표시하며 다시 제출하지 않는다', () => {
    const client = new QueryClient();
    client.setQueryData(['VoterPoll', 12], {
      id: 12,
      tableInfo: { id: 90, name: '완료한 토론', agenda: '완료 주제' },
    });
    renderAt('/vote/end?pollId=12', client);
    expect(screen.getByText('완료한 토론')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '투표가 완료되었습니다.' }),
    ).toBeInTheDocument();
  });
  it.each(['/vote/end', '/vote/end?pollId=0', '/vote/end?pollId=NaN'])(
    '식별자 없는 이전 링크 %s도 완료 안내와 대체 정보를 유지한다',
    (path) => {
      renderAt(path);
      expect(screen.getByText('시간표 이름 없음')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: '투표가 완료되었습니다.' }),
      ).toBeInTheDocument();
    },
  );
  it('새로고침의 정보 조회가 실패해도 완료 안내와 재시도를 유지한다', async () => {
    server.use(
      http.get(
        `${ApiUrl.poll}/12/votes`,
        () => new HttpResponse(null, { status: 404 }),
      ),
    );
    renderAt('/vote/end?pollId=12');
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(
      screen.getByRole('heading', { name: '투표가 완료되었습니다.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '정보 다시 불러오기' }),
    ).toBeInTheDocument();
  });
});
