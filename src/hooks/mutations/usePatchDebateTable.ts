import { useMutation } from '@tanstack/react-query';
import { patchDebateTableData } from '../../apis/apis/debateTable';
import { PatchDebateTableResponseType } from '../../apis/responses/debateTable';

interface PatchDebateTableParams {
  tableId: number;
}

export default function usePatchDebateTable(
  onSuccess: (tableId: number) => void,
) {
  return useMutation<
    PatchDebateTableResponseType,
    Error,
    PatchDebateTableParams
  >({
    mutationFn: async ({ tableId }) => patchDebateTableData(tableId),
    onSuccess: (response: PatchDebateTableResponseType) => {
      onSuccess(response.id);
    },
    onError: (error) => {
      console.error('Error starting customize debate:', error);
    },
  });
}
