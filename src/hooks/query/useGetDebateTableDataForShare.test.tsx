import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ApiUrl } from '../../apis/endpoints';
import { GetDebateTableDataForShareResponseType } from '../../apis/responses/live';
import { useGetDebateTableDataForShare } from './useGetDebateTableDataForShare';

const mockDebateTableForShare: GetDebateTableDataForShareResponseType = {
  id: 302,
  info: {
    name: '공유용 자유토론 테이블',
    agenda: '공유 토론 주제',
    prosTeamName: '찬성',
    consTeamName: '반대',
  },
  table: [
    {
      stance: 'NEUTRAL',
      speechType: '자유토론',
      bell: null,
      boxType: 'TIME_BASED',
      time: null,
      timePerTeam: 60,
      timePerSpeaking: 30,
      speaker: null,
    },
  ],
};

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useGetDebateTableDataForShare', () => {
  test('공유용 토론 테이블 데이터를 조회하고 캐시에 저장한다', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    server.use(
      http.get(`${ApiUrl.live}/table/customize/:tableId`, () => {
        return HttpResponse.json(mockDebateTableForShare);
      }),
    );

    const { result } = renderHook(() => useGetDebateTableDataForShare(302), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockDebateTableForShare);
    expect(queryClient.getQueryData(['DebateTableDataForShare', 302])).toEqual(
      mockDebateTableForShare,
    );
  });
});
