import { useMutation } from '@tanstack/react-query';
import { patchDebateTableData } from '../../apis/apis/customize';
import { PatchDebateTableResponseType } from '../../apis/responses/customize';

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
