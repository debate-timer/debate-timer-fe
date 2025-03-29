import { useMutation } from '@tanstack/react-query';
import { putParliamentaryDebateTable } from '../../apis/apis/parliamentary';
import { PutDebateTableResponseType } from '../../apis/responses/parliamentary';
import {
  ParliamentaryDebateInfo,
  ParliamentaryTimeBoxInfo,
} from '../../type/type';

interface PutParliamentaryTableParams {
  tableId: number;
  info: ParliamentaryDebateInfo;
  table: ParliamentaryTimeBoxInfo[];
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
