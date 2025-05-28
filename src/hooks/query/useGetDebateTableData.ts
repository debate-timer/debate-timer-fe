import { useQuery } from '@tanstack/react-query';
import { getRepository } from '../../repositories/DebateTableRepository';
import { GetDebateTableResponseType } from '../../apis/responses/debateTable';

export function useGetDebateTableData(tableId: number, enabled?: boolean) {
  return useQuery<GetDebateTableResponseType>({
    queryKey: ['DebateTableData', tableId],
    queryFn: async () => {
      const repo = getRepository();
      return repo.getTable(tableId);
    },
    enabled,
  });
}
