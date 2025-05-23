import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDebateTableData } from '../../apis/apis/customize';

interface DeleteDebateTableParams {
  tableId: number;
}

export function useDeleteDebateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tableId }: DeleteDebateTableParams) =>
      await deleteDebateTableData(tableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['DebateTableList'] });

      setTimeout(() => {
        alert('테이블이 제거되었습니다.');
      }, 300);
    },
    onError: (error) => {
      console.error('Error deleting customize table:', error);
    },
  });
}
