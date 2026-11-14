import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getVoterPollInfo } from '../../apis/apis/poll';
import { getDebateTableDataForShare } from '../../apis/apis/live';

interface CompletionTableInfo {
  name: string;
  agenda: string;
}

function readTableInfo(
  data: unknown,
  id: number | undefined,
): CompletionTableInfo | undefined {
  if (
    typeof data !== 'object' ||
    data === null ||
    !('id' in data) ||
    data.id !== id
  ) {
    return undefined;
  }
  const info =
    'tableInfo' in data
      ? data.tableInfo
      : 'info' in data
        ? data.info
        : undefined;
  if (
    typeof info !== 'object' ||
    info === null ||
    !('name' in info) ||
    !('agenda' in info) ||
    typeof info.name !== 'string' ||
    typeof info.agenda !== 'string'
  ) {
    return undefined;
  }
  return { name: info.name, agenda: info.agenda };
}

/** 완료 헤더는 기존 공개 응답 캐시를 재사용하며 유효 캐시가 없을 때만 조회함. */
export default function useGetCompletionInfo(
  kind: 'poll' | 'live',
  id: number | undefined,
) {
  const client = useQueryClient();
  const key = [kind === 'poll' ? 'VoterPoll' : 'DebateTableDataForShare', id];
  const isValidId = id !== undefined && Number.isSafeInteger(id) && id > 0;
  const hasValidCache =
    isValidId && readTableInfo(client.getQueryData(key), id) !== undefined;
  return useQuery<unknown, Error, CompletionTableInfo | undefined>({
    queryKey: key,
    queryFn: async () => {
      if (!isValidId) {
        throw new Error('INVALID_COMPLETION_ID');
      }
      return kind === 'poll'
        ? await getVoterPollInfo(id)
        : await getDebateTableDataForShare(id);
    },
    select: (data) => readTableInfo(data, id),
    enabled: isValidId && !hasValidCache,
    staleTime: Infinity,
    refetchOnMount: hasValidCache ? false : 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    throwOnError: false,
  });
}
