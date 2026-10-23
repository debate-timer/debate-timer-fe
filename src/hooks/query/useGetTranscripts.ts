import { useQuery } from '@tanstack/react-query';
import { getTranscripts } from '../../apis/apis/transcript';
import { GetTranscriptsResponseType } from '../../apis/responses/transcript';

// 대시보드 토론 기록 목록. 생성 중인 기록이 있으면 완료될 때까지 주기적으로 다시 조회한다.
const POLLING_INTERVAL_MS = 5000;

export function useGetTranscripts(enabled: boolean) {
  return useQuery<GetTranscriptsResponseType>({
    queryKey: ['Transcripts'],
    queryFn: getTranscripts,
    enabled,
    refetchInterval: (query) =>
      query.state.data?.transcripts.some(
        (transcript) =>
          transcript.refining || transcript.status === 'PROCESSING',
      )
        ? POLLING_INTERVAL_MS
        : false,
    throwOnError: false,
  });
}
