import { useMutation } from '@tanstack/react-query';
import { CustomizeDebateInfo, CustomizeTimeBoxInfo } from '../../type/type';
import { PutCustomizeTableResponseType } from '../../apis/responses/customize';
import { putCustomizeTableData } from '../../apis/apis/customize';

interface PutCustomizeTableParams {
  tableId: number;
  info: CustomizeDebateInfo;
  table: CustomizeTimeBoxInfo[];
}

export function usePutCustomizeDebateTable(onSuccess: () => void) {
  return useMutation<
    PutCustomizeTableResponseType,
    Error,
    PutCustomizeTableParams
  >({
    mutationFn: ({ tableId, info, table }) =>
      putCustomizeTableData(tableId, info, table),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error('Error updating parliamentary table:', error);
    },
  });
}
