import { useQuery } from '@tanstack/react-query';
import { getRecordingSessionV2 } from '../../apis/apis/recordingV2';
import { GetRecordingSessionV2ResponseType } from '../../apis/responses/recordingV2';

const POLLING_INTERVAL_MS = 2000;

// 서버가 남은 턴을 전사하고 속기록을 만들 때까지(COMPLETED·FAILED 전) 주기적으로 다시 조회한다.
export function useGetRecordingSessionV2(
  sessionKey: string | null,
  enabled: boolean,
) {
  return useQuery<GetRecordingSessionV2ResponseType>({
    queryKey: ['RecordingSessionV2', sessionKey],
    queryFn: () => getRecordingSessionV2(sessionKey ?? ''),
    enabled: enabled && sessionKey !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'COMPLETED' || status === 'FAILED'
        ? false
        : POLLING_INTERVAL_MS;
    },
    throwOnError: false,
  });
}
