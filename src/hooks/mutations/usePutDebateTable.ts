import { useMutation } from '@tanstack/react-query';
import { DebateInfo, TimeBoxInfo } from '../../type/type';
import { PutDebateTableResponseType } from '../../apis/responses/customize';
import { putDebateTableData } from '../../apis/apis/customize';

interface PutDebateTableParams {
  tableId: number;
  info: DebateInfo;
  table: TimeBoxInfo[];
}

export function usePutDebateTable(onSuccess: (tableId: number) => void) {
  return useMutation<PutDebateTableResponseType, Error, PutDebateTableParams>({
    mutationFn: ({ tableId, info, table }) =>
      putDebateTableData(tableId, info, table),
    onSuccess: (response: PutDebateTableResponseType) => {
      onSuccess(response.id);
    },
    onError: (error) => {
      console.error('Error updating customize table:', error);
    },
  });
}
