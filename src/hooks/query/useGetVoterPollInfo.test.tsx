import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ApiUrl } from '../../apis/endpoints';
import { useGetVoterPollInfo } from './useGetVoterPollInfo';

afterEach(cleanup);

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

describe('투표 참여 정보 조회 훅', () => {
  it('전역 throwOnError가 true여도 조회 실패 시 예외를 던지지 않고 1회만 요청한다', async () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          throwOnError: true,
        },
      },
    });
    let requests = 0;

    server.use(
      http.get(`${ApiUrl.poll}/12/votes`, () => {
        requests += 1;
        return HttpResponse.error();
      }),
    );

    const { result } = renderHook(() => useGetVoterPollInfo(12), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(requests).toBe(1);
  });
});
