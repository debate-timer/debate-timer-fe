import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/react';
import { APIError } from '../../apis/primitives';
import { markSentryCaptured } from '../../util/sentry';
import ErrorBoundary from './ErrorBoundary';

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
                <Route path="/home" element={<h1>복구된 홈 화면</h1>} />
              </Routes>
            </MemoryRouter>
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
});

/** API 계층에서 수집한 오류의 표식을 동일하게 준비함. */
function markCapturedApiError() {
  const error = new APIError('검증용 API 오류', 500, null);
  markSentryCaptured(error);
  return error;
}
