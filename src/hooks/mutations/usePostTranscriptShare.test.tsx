import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { GetTranscriptResponseType } from '../../apis/responses/transcript';
import usePostTranscriptShare from './usePostTranscriptShare';

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('토론 기록 공유 링크 발급', () => {
  it('발급한 공유 토큰을 콜백으로 넘기고 기록 캐시에 반영한다', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(['Transcript', 9], {
      id: 9,
      shareToken: null,
    } as GetTranscriptResponseType);
    const onSuccess = vi.fn();
    const { result } = renderHook(() => usePostTranscriptShare(onSuccess), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate(9);
    });

    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith('mock-share-token'),
    );
    expect(
      queryClient.getQueryData<GetTranscriptResponseType>(['Transcript', 9])
        ?.shareToken,
    ).toBe('mock-share-token');
  });
});
