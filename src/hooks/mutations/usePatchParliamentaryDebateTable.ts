import { useMutation } from '@tanstack/react-query';
import { patchParliamentaryDebateTable } from '../../apis/apis';
import { PatchDebateTableResponseType } from '../../apis/responseTypes';

interface PatchParliamentaryTableParams {
  tableId: number;
}

export function usePatchParliamentaryDebateTable(
  onSuccess: (tableId: number) => void,
) {
  return useMutation<
    PatchDebateTableResponseType,
    Error,
    PatchParliamentaryTableParams
  >({
    mutationFn: ({ tableId }) => patchParliamentaryDebateTable(tableId),
    onSuccess: (response: PatchDebateTableResponseType) => {
      onSuccess(response.id);
    },
    onError: (error) => {
      console.error('Error patching parliamentary table:', error);
    },
  });
}
