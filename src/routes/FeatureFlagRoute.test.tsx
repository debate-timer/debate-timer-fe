import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { ApiUrl } from '../apis/endpoints';
import FeatureFlagRoute from './FeatureFlagRoute';

function renderRoute() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/records/1']}>
        <Routes>
          <Route
            path="/records/1"
            element={
              <FeatureFlagRoute flag="TRANSCRIPT">
                <p>토론 기록 화면</p>
              </FeatureFlagRoute>
            }
          />
          <Route path="/" element={<p>대시보드</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const respondFlags = (featureFlags: string[]) =>
  server.use(
    http.get(`${ApiUrl.member}/feature-flags`, () =>
      HttpResponse.json({ featureFlags }),
    ),
  );

describe('피쳐 플래그 라우트', () => {
  it('플래그가 있으면 화면을 보여준다', async () => {
    respondFlags(['TRANSCRIPT']);

    renderRoute();

    expect(await screen.findByText('토론 기록 화면')).toBeInTheDocument();
  });

  it('플래그가 없으면 대시보드로 이동한다', async () => {
    respondFlags([]);

    renderRoute();

    expect(await screen.findByText('대시보드')).toBeInTheDocument();
    expect(screen.queryByText('토론 기록 화면')).not.toBeInTheDocument();
  });
});
