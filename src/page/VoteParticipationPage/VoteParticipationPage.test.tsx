import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import GlobalSettingsProvider from '../../components/GlobalSettingsProvider/GlobalSettingsProvider';
import { GlobalPortal } from '../../util/GlobalPortal';
import { server } from '../../mocks/server';
import { ApiUrl } from '../../apis/endpoints';
import VoteParticipationPage from './VoteParticipationPage';

function renderVoteParticipationPage(
  path = '/vote/12',
  client = new QueryClient({
    defaultOptions: {
      queries: {
        throwOnError: true,
      },
    },
  }),
) {
  return render(
    <QueryClientProvider client={client}>
      <GlobalSettingsProvider>
        <GlobalPortal.Provider>
          <MemoryRouter initialEntries={[path]}>
            <ErrorBoundary>
              <Routes>
                <Route path="/vote/:id" element={<VoteParticipationPage />} />
              </Routes>
            </ErrorBoundary>
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

describe('투표 참여 페이지', () => {
  it('투표 정보 조회가 실패해도 ErrorBoundary로 전파하지 않고 지역 재시도 UI를 표시해 복구할 수 있다', async () => {
    let shouldFail = true;
    server.use(
      http.get(`${ApiUrl.poll}/12/votes`, () => {
        if (shouldFail) {
          return HttpResponse.error();
        }

        return HttpResponse.json({
          id: 12,
          status: 'PROGRESS',
          prosTeamName: '찬성',
          consTeamName: '반대',
          participateCode: '1234',
          tableInfo: {
            id: 90,
            name: '테스트 토론',
            agenda: '테스트 주제',
          },
        });
      }),
    );

    const user = userEvent.setup();
    renderVoteParticipationPage();

    const retryButton = await screen.findByRole('button', {
      name: /다시 시도/,
    });
    expect(retryButton).toBeInTheDocument();

    shouldFail = false;
    await user.click(retryButton);

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: '승패투표' }),
      ).toBeInTheDocument(),
    );
  });
});
