import { useMutation } from '@tanstack/react-query';
import { DebateTableData } from '../../type/type';
import { PutDebateTableResponseType } from '../../apis/responses/debateTable';
import { getRepository } from '../../repositories/DebateTableRepository';

interface PutDebateTableParams extends DebateTableData {
  tableId: number;
}

export function usePutDebateTable(onSuccess: (tableId: number) => void) {
  return useMutation<PutDebateTableResponseType, Error, PutDebateTableParams>({
    mutationFn: ({ tableId, info, table }) => {
      const repo = getRepository();
      return repo.editTable({ id: tableId, info, table });
    },
    onSuccess: (response: PutDebateTableResponseType) => {
      onSuccess(response.id);
    },
    onError: (error) => {
      console.error('Error updating customize table:', error);
    },
  });
}
