import { useMutation } from '@tanstack/react-query';
import { putParliamentaryDebateTable } from '../../apis/apis';
import { PutDebateTableResponseType } from '../../apis/responseTypes';
import { DebateInfo } from '../../type/type';

interface PutParliamentaryTableParams {
  tableId: number;
  tableName: string;
  tableAgenda: string;
  warningBell: boolean;
  finishBell: boolean;
  table: DebateInfo[];
}

export function usePutParliamentaryDebateTable(
  onSuccess: (tableId: number) => void,
) {
  return useMutation<
    PutDebateTableResponseType,
    Error,
    PutParliamentaryTableParams
  >({
    mutationFn: ({
      tableId,
      tableName,
      tableAgenda,
      table,
      warningBell,
      finishBell,
    }) =>
      putParliamentaryDebateTable(
        tableId,
        tableName,
        tableAgenda,
        warningBell,
        finishBell,
        table,
      ),
    onSuccess: (response: PutDebateTableResponseType) => {
      onSuccess(response.id);
    },
    onError: (error) => {
      console.error('Error updating parliamentary table:', error);
    },
  });
}
