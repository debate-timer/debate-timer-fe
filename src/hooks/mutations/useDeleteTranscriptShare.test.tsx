import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { GetTranscriptResponseType } from '../../apis/responses/transcript';
import useDeleteTranscriptShare from './useDeleteTranscriptShare';

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('토론 기록 공유 해제', () => {
  it('공유를 해제하면 콜백을 부르고 기록 캐시의 공유 토큰을 지운다', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(['Transcript', 9], {
      id: 9,
      shareToken: 'share-token',
    } as GetTranscriptResponseType);
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useDeleteTranscriptShare(onSuccess), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate(9);
    });

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(
      queryClient.getQueryData<GetTranscriptResponseType>(['Transcript', 9])
        ?.shareToken,
    ).toBeNull();
  });
});
