import { useQuery } from '@tanstack/react-query';
import { getCustomizeTableData } from '../../apis/apis/customize';

export function useGetCustomizeTableData(tableId: number, enabled?: boolean) {
  return useQuery({
    queryKey: ['CustomizeTableData', tableId],
    queryFn: () => getCustomizeTableData(tableId),
    enabled,
  });
}
