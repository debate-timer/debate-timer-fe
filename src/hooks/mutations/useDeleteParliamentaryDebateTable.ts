import { useMutation } from '@tanstack/react-query';
import { deleteParliamentaryDebateTable } from '../../apis/apis';

interface DeleteParliamentaryTableParams {
  tableId: number;
  memberId: number;
}

export function useDeleteParliamentaryDebateTable() {
  return useMutation<boolean, Error, DeleteParliamentaryTableParams>({
    mutationFn: ({ tableId, memberId }) =>
      deleteParliamentaryDebateTable(tableId, memberId),
    onSuccess: () => {
      alert('테이블이 제거되었습니다.');
    },
    onError: (error) => {
      console.error('Error deleting parliamentary table:', error);
    },
  });
}
