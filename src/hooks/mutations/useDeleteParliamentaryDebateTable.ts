import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteParliamentaryDebateTable } from '../../apis/apis/parliamentary';

interface DeleteParliamentaryTableParams {
  tableId: number;
}

export function useDeleteParliamentaryDebateTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tableId }: DeleteParliamentaryTableParams) =>
      await deleteParliamentaryDebateTable(tableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['DebateTableList'] });

      setTimeout(() => {
        alert('테이블이 제거되었습니다.');
      }, 300);
    },
    onError: (error) => {
      console.error('Error deleting parliamentary table:', error);
    },
  });
}
