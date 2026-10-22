import { useQuery } from '@tanstack/react-query';
import { getTranscript } from '../../apis/apis/transcript';
import { GetTranscriptResponseType } from '../../apis/responses/transcript';

const POLLING_INTERVAL_MS = 2000;

// 분석이 끝날 때까지(PROCESSING) 주기적으로 다시 조회한다.
export function useGetTranscript(transcriptId: number, enabled: boolean) {
  return useQuery<GetTranscriptResponseType>({
    queryKey: ['Transcript', transcriptId],
    queryFn: () => getTranscript(transcriptId),
    enabled,
    refetchInterval: (query) =>
      query.state.data?.status === 'PROCESSING' ? POLLING_INTERVAL_MS : false,
    throwOnError: false,
  });
}
