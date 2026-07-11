import { useQuery } from '@tanstack/react-query';
import { getDebateTableDataForShare } from '../../apis/apis/live';
import { GetDebateTableDataForShareResponseType } from '../../apis/responses/live';

export const debateTableDataForShareQueryKey = (tableId: number | undefined) =>
  ['DebateTableDataForShare', tableId] as const;

export function useGetDebateTableDataForShare(
  tableId: number | undefined,
  options?: { enabled?: boolean },
) {
  const isEnabled =
    tableId !== undefined && !isNaN(tableId) && (options?.enabled ?? true);

  return useQuery<GetDebateTableDataForShareResponseType>({
    queryKey: debateTableDataForShareQueryKey(tableId),
    queryFn: () => getDebateTableDataForShare(tableId!), // 위 isEnabled에서 tableId 타입 검증에서 !가 들어가도 됨
    enabled: isEnabled,
    throwOnError: false,
  });
}
