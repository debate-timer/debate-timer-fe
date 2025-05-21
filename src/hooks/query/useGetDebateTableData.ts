import { useQuery } from '@tanstack/react-query';
import { getDebateTableData } from '../../apis/apis/customize';

export function useGetDebateTableData(tableId: number, enabled?: boolean) {
  return useQuery({
    queryKey: ['DebateTableData', tableId],
    queryFn: () => getDebateTableData(tableId),
    enabled,
  });
}
