import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { ApiUrl } from '../apis/endpoints';
import useFeatureFlag from './useFeatureFlag';

const FEATURE_FLAGS_URL = `${ApiUrl.member}/feature-flags`;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

const respondFlags = (featureFlags: string[]) =>
  server.use(
    http.get(FEATURE_FLAGS_URL, () => HttpResponse.json({ featureFlags })),
  );

describe('피쳐 플래그 훅', () => {
  it('회원에게 플래그가 있으면 사용할 수 있다', async () => {
    respondFlags(['TRANSCRIPT']);

    const { result } = renderHook(() => useFeatureFlag('TRANSCRIPT'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isEnabled).toBe(false);
    await waitFor(() => expect(result.current.isEnabled).toBe(true));
    expect(result.current.isLoading).toBe(false);
  });

  it('회원에게 플래그가 없으면 사용할 수 없다', async () => {
    respondFlags([]);

    const { result } = renderHook(() => useFeatureFlag('TRANSCRIPT'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isEnabled).toBe(false);
  });

  it('조회에 실패하면 사용할 수 없다', async () => {
    server.use(
      http.get(FEATURE_FLAGS_URL, () =>
        HttpResponse.json({ message: '서버 오류' }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useFeatureFlag('TRANSCRIPT'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isEnabled).toBe(false);
  });

  it('조회하지 않도록 하면 요청하지 않고 사용할 수 없다', async () => {
    let requestCount = 0;
    server.use(
      http.get(FEATURE_FLAGS_URL, () => {
        requestCount += 1;
        return HttpResponse.json({ featureFlags: ['TRANSCRIPT'] });
      }),
    );

    const { result } = renderHook(
      () => useFeatureFlag('TRANSCRIPT', { enabled: false }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isEnabled).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(requestCount).toBe(0);
  });
});
