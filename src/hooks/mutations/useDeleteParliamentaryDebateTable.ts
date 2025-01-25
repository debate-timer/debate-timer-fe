import { useMutation } from '@tanstack/react-query';
import { deleteParliamentaryDebateTable } from '../../apis/apis';

interface DeleteParliamentaryTableParams {
  tableId: number;
  memberId: number;
}

export function useDeleteParliamentaryDebateTable() {
  return useMutation({
    mutationFn: async ({ tableId, memberId }: DeleteParliamentaryTableParams) =>
      await deleteParliamentaryDebateTable(tableId, memberId),

    onSuccess: () => {
      alert('테이블이 제거되었습니다.');

      // 삭제 성공 후 페이지 강제 새로고침
      window.location.reload();
    },

    onError: (error) => {
      console.error('Error deleting parliamentary table:', error);
      alert('테이블 삭제에 실패했습니다.');
    },
  });
}
