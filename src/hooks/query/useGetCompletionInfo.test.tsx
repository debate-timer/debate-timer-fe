import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ApiUrl } from '../../apis/endpoints';
import useGetCompletionInfo from './useGetCompletionInfo';

afterEach(cleanup);

function createWrapper(client: QueryClient) {
  return function Wrapper(props: PropsWithChildren) {
    return (
      <QueryClientProvider client={client}>
        {props.children}
      </QueryClientProvider>
    );
  };
}

describe('완료 정보 조회', () => {
  it.each(['poll', 'live'] as const)(
    '오래된 %s 캐시도 유효하면 추가 요청 없이 재사용한다',
    async (kind) => {
      const client = new QueryClient();
      const key =
        kind === 'poll' ? ['VoterPoll', 12] : ['DebateTableDataForShare', 12];
      const data =
        kind === 'poll'
          ? { id: 12, tableInfo: { id: 90, name: '시간표', agenda: '주제' } }
          : { id: 12, info: { name: '시간표', agenda: '주제' }, table: [] };
      client.setQueryData(key, data, { updatedAt: 1 });
      let requests = 0;
      server.use(
        http.get('*', () => {
          requests += 1;
          return HttpResponse.json({}, { status: 500 });
        }),
      );
      const { result } = renderHook(() => useGetCompletionInfo(kind, 12), {
        wrapper: createWrapper(client),
      });
      expect(result.current.data).toEqual({ name: '시간표', agenda: '주제' });
      await act(async () => {
        window.dispatchEvent(new Event('focus'));
        window.dispatchEvent(new Event('online'));
      });
      expect(requests).toBe(0);
    },
  );
  it('캐시가 없으면 기존 공개 투표 API를 조회한다', async () => {
    const client = new QueryClient();
    let requests = 0;
    server.use(
      http.get(`${ApiUrl.poll}/12/votes`, () => {
        requests += 1;
        return HttpResponse.json({
          id: 12,
          tableInfo: { id: 90, name: '토론', agenda: null },
        });
      }),
    );
    const { result } = renderHook(() => useGetCompletionInfo('poll', 12), {
      wrapper: createWrapper(client),
    });
    await waitFor(() =>
      expect(result.current.data).toEqual({ name: '토론', agenda: '' }),
    );
    expect(requests).toBe(1);
    expect(client.getQueryData(['VoterPoll', 12])).toMatchObject({ id: 12 });
  });
  it('잘못된 식별자는 조회하지 않는다', () => {
    const client = new QueryClient();
    const { result } = renderHook(
      () => useGetCompletionInfo('poll', undefined),
      { wrapper: createWrapper(client) },
    );
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });
  it('다른 ID의 캐시를 표시하지 않고 조회 실패를 지역에서 처리한다', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { throwOnError: true } },
    });
    client.setQueryData(['VoterPoll', 12], {
      id: 13,
      tableInfo: { name: '다른 토론', agenda: '다른 주제' },
    });
    server.use(
      http.get(
        `${ApiUrl.poll}/12/votes`,
        () => new HttpResponse(null, { status: 404 }),
      ),
    );
    const { result } = renderHook(() => useGetCompletionInfo('poll', 12), {
      wrapper: createWrapper(client),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
