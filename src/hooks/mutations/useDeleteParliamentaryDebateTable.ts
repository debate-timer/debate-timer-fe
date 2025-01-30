import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteParliamentaryDebateTable } from '../../apis/apis';

interface DeleteParliamentaryTableParams {
  tableId: number;
  memberId: number;
}

export function useDeleteParliamentaryDebateTable() {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, DeleteParliamentaryTableParams>({
    mutationFn: ({ tableId, memberId }) =>
      deleteParliamentaryDebateTable(tableId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['DebateTableList'] });
    },
    onError: (error) => {
      console.error('Error deleting parliamentary table:', error);
    },
  });
}
