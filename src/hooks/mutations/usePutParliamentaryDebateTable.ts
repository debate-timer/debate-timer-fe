import { useMutation } from '@tanstack/react-query';
import { putParliamentaryDebateTable } from '../../apis/apis';
import { PutDebateTableResponseType } from '../../apis/responseTypes';
import { DetailDebateInfo, TimeBoxInfo } from '../../type/type';

interface PutParliamentaryTableParams {
  tableId: number;
  info: DetailDebateInfo;
  table: TimeBoxInfo[];
}

export function usePutParliamentaryDebateTable(
  onSuccess: (tableId: number) => void,
) {
  return useMutation<
    PutDebateTableResponseType,
    Error,
    PutParliamentaryTableParams
  >({
    mutationFn: ({ tableId, info, table }) =>
      putParliamentaryDebateTable(tableId, info, table),
    onSuccess: (response: PutDebateTableResponseType) => {
      onSuccess(response.id);
    },
    onError: (error) => {
      console.error('Error updating parliamentary table:', error);
    },
  });
}
