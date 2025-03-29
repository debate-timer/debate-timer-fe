import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCustomizeTableData } from '../../apis/apis/customize';

interface DeleteCustomizeTableParams {
  tableId: number;
}

export function useDeleteCustomizeDebateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tableId }: DeleteCustomizeTableParams) =>
      await deleteCustomizeTableData(tableId),
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
