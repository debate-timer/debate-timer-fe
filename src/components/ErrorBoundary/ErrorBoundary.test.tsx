import GlobalSettingsProvider from '../GlobalSettingsProvider/GlobalSettingsProvider';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, StrictMode } from 'react';
import {
  createMemoryRouter,
  MemoryRouter,
  Route,
  RouterProvider,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/react';
import { APIError } from '../../apis/primitives';
import { markSentryCaptured } from '../../util/sentry';
import ErrorBoundary from './ErrorBoundary';
import ErrorBoundaryWrapper from './ErrorBoundaryWrapper';

vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
  withScope: vi.fn((callback) =>
    callback({
      setLevel: vi.fn(),
      setTags: vi.fn(),
      setContext: vi.fn(),
      setFingerprint: vi.fn(),
    }),
  ),
}));

describe('렌더 오류 경계', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it.each([
    { name: '렌더 오류', error: new Error('검증용 렌더 오류'), captures: 1 },
    {
      name: '이미 수집된 API 오류',
      error: markCapturedApiError(),
      captures: 0,
    },
  ])(
    '$name의 오류 화면과 복구를 유지하고 중복 수집하지 않는다',
    async ({ error, captures }) => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(console, 'log').mockImplementation(() => {});
      const user = userEvent.setup();
      let shouldThrow = true;
      function FailedScreen() {
        if (shouldThrow) {
          throw error;
        }
        return <p>복구된 화면</p>;
      }

      render(
        <StrictMode>
          <QueryClientProvider client={new QueryClient()}>
            <GlobalSettingsProvider>
              <MemoryRouter initialEntries={['/table/customize/1']}>
                <Routes>
                  <Route
                    path="/table/customize/1"
                    element={
                      <ErrorBoundary>
                        <FailedScreen />
                      </ErrorBoundary>
                    }
                  />
                  <Route path="/" element={<h1>복구된 홈 화면</h1>} />
                </Routes>
              </MemoryRouter>
            </GlobalSettingsProvider>
          </QueryClientProvider>
        </StrictMode>,
      );

      expect(screen.getByText(error.message)).toBeInTheDocument();
      expect(Sentry.captureException).toHaveBeenCalledTimes(captures);
      if (captures === 1) {
        expect(Sentry.captureException).toHaveBeenCalledWith(
          expect.objectContaining({ message: error.message }),
        );
      }
      shouldThrow = false;
      await user.click(screen.getByRole('button', { name: '홈으로 돌아가기' }));
      expect(
        screen.getByRole('heading', { name: '복구된 홈 화면' }),
      ).toBeInTheDocument();
      expect(Sentry.captureException).toHaveBeenCalledTimes(captures);
    },
  );

  it('실패하는 라우트에서 홈으로 돌아갈 때 구 라우트를 다시 렌더링하지 않고 한 번만 오류를 수집한다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const user = userEvent.setup();

    function AlwaysThrowingShareScreen(): ReactNode {
      throw new Error('공유된 데이터가 비어 있어요.');
    }

    const router = createMemoryRouter(
      [
        {
          element: <ErrorBoundaryWrapper />,
          children: [
            { path: '/share', element: <AlwaysThrowingShareScreen /> },
            { path: '/', element: <h1>정상 홈 화면</h1> },
          ],
        },
      ],
      { initialEntries: ['/share'] },
    );

    render(
      <QueryClientProvider client={new QueryClient()}>
        <GlobalSettingsProvider>
          <RouterProvider router={router} />
        </GlobalSettingsProvider>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText('공유된 데이터가 비어 있어요.'),
    ).toBeInTheDocument();
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: '홈으로 돌아가기' }));

    expect(
      await screen.findByRole('heading', { name: '정상 홈 화면' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });

  it('정상 경로에서 실패하는 경로로 이동해 처음 오류가 발생해도 초기화하지 않고 한 번만 수집한다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const user = userEvent.setup();

    function HomeWithLink() {
      const navigate = useNavigate();
      return (
        <button type="button" onClick={() => navigate('/failing')}>
          실패 경로 이동
        </button>
      );
    }

    function FailingRouteScreen(): ReactNode {
      throw new Error('새 경로 렌더 오류');
    }

    const router = createMemoryRouter(
      [
        {
          element: <ErrorBoundaryWrapper />,
          children: [
            { path: '/', element: <HomeWithLink /> },
            { path: '/failing', element: <FailingRouteScreen /> },
          ],
        },
      ],
      { initialEntries: ['/'] },
    );

    render(
      <QueryClientProvider client={new QueryClient()}>
        <GlobalSettingsProvider>
          <RouterProvider router={router} />
        </GlobalSettingsProvider>
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole('button', { name: '실패 경로 이동' }));

    expect(await screen.findByText('새 경로 렌더 오류')).toBeInTheDocument();
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });
});

/** API 계층에서 수집한 오류의 표식을 동일하게 준비함. */
function markCapturedApiError() {
  const error = new APIError('검증용 API 오류', 500, null);
  markSentryCaptured(error);
  return error;
}
