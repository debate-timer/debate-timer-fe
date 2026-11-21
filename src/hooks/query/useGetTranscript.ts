import { useQuery } from '@tanstack/react-query';
import { getTranscript } from '../../apis/apis/transcript';
import { GetTranscriptResponseType } from '../../apis/responses/transcript';
import { isTranscriptGenerating } from '../../util/transcriptStatus';

const POLLING_INTERVAL_MS = 2000;

// 속기록 보정과 분석이 끝날 때까지(refining, PROCESSING) 주기적으로 다시 조회한다. 실패하면 멈춘다.
export function useGetTranscript(transcriptId: number, enabled: boolean) {
  return useQuery<GetTranscriptResponseType>({
    queryKey: ['Transcript', transcriptId],
    queryFn: () => getTranscript(transcriptId),
    enabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data && isTranscriptGenerating(data) ? POLLING_INTERVAL_MS : false;
    },
    throwOnError: false,
  });
}
