import { useMutation } from '@tanstack/react-query';
import { DebateInfo, TimeBoxInfo } from '../../type/type';
import { PutCustomizeTableResponseType } from '../../apis/responses/customize';
import { putCustomizeTableData } from '../../apis/apis/customize';

interface PutCustomizeTableParams {
  tableId: number;
  info: DebateInfo;
  table: TimeBoxInfo[];
}

export function usePutCustomizeDebateTable(
  onSuccess: (tableId: number) => void,
) {
  return useMutation<
    PutCustomizeTableResponseType,
    Error,
    PutCustomizeTableParams
  >({
    mutationFn: ({ tableId, info, table }) =>
      putCustomizeTableData(tableId, info, table),
    onSuccess: (response: PutCustomizeTableResponseType) => {
      onSuccess(response.id);
    },
    onError: (error) => {
      console.error('Error updating customize table:', error);
    },
  });
}
