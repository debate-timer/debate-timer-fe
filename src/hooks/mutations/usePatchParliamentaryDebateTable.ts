import { useMutation } from '@tanstack/react-query';
import { patchParliamentaryDebateTable } from '../../apis/apis/parliamentary';
import { PatchDebateTableResponseType } from '../../apis/responses/parliamentary';

interface UsePatchParliamentaryTableParams {
  tableId: number;
}

export default function usePatchParliamentaryTable(
  onSuccess: (tableId: number) => void,
) {
  return useMutation<
    PatchDebateTableResponseType,
    Error,
    UsePatchParliamentaryTableParams
  >({
    mutationFn: async ({ tableId }) => patchParliamentaryDebateTable(tableId),
    onSuccess: (response: PatchDebateTableResponseType) => {
      onSuccess(response.id);
    },
    onError: (error) => {
      console.error('Error patching parliamentary debate:', error);
    },
  });
}
