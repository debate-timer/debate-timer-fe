import { useQuery } from '@tanstack/react-query';
import { getDebateTableDataForShare } from '../../apis/apis/live';
import { GetDebateTableDataForShareResponseType } from '../../apis/responses/live';

export const debateTableDataForShareQueryKey = (tableId: number) =>
  ['DebateTableDataForShare', tableId] as const;

export function useGetDebateTableDataForShare(
  tableId: number,
  options?: { enabled?: boolean },
) {
  return useQuery<GetDebateTableDataForShareResponseType>({
    queryKey: debateTableDataForShareQueryKey(tableId),
    queryFn: () => getDebateTableDataForShare(tableId),
    enabled: options?.enabled,
    throwOnError: false,
  });
}
