import { useQuery } from '@tanstack/react-query';
import { getSharedTranscript } from '../../apis/apis/transcript';
import { GetSharedTranscriptResponseType } from '../../apis/responses/transcript';
import { APIError } from '../../apis/primitives';

const POLLING_INTERVAL_MS = 2000;
const MAX_RETRY_COUNT = 3;

// 공유받은 기록도 보정과 분석이 끝날 때까지(refining, PROCESSING) 주기적으로 다시 조회한다.
export function useGetSharedTranscript(shareToken: string, enabled: boolean) {
  return useQuery<GetSharedTranscriptResponseType>({
    queryKey: ['SharedTranscript', shareToken],
    queryFn: () => getSharedTranscript(shareToken),
    enabled,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.refining || data?.status === 'PROCESSING'
        ? POLLING_INTERVAL_MS
        : false;
    },
    // 공유가 중지됐거나 없는 토큰(404)은 다시 시도해도 같으므로 바로 안내한다.
    retry: (failureCount, error) =>
      !(error instanceof APIError && error.status === 404) &&
      failureCount < MAX_RETRY_COUNT,
    throwOnError: false,
  });
}
