import { useQuery } from '@tanstack/react-query';
import { getParliamentaryTableData } from '../../apis/apis';

export function useGetParliamentaryTableData(
  tableId: number,
  enabled?: boolean,
) {
  return useQuery({
    queryKey: ['ParliamentaryTableData', tableId],
    queryFn: () => getParliamentaryTableData(tableId),
    enabled,
  });
}
