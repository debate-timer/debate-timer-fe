import { useMutation } from '@tanstack/react-query';
import { patchCustomizeTableData } from '../../apis/apis/customize';
import { PatchCustomizeTableResponseType } from '../../apis/responses/customize';

interface UsePatchCustomizeTableParams {
  id: number;
}

export default function usePatchCustomizeTable(
  onSuccess: (tableId: number) => void,
) {
  return useMutation<
    PatchCustomizeTableResponseType,
    Error,
    UsePatchCustomizeTableParams
  >({
    mutationFn: async ({ id }) => patchCustomizeTableData(id),
    onSuccess: (response: PatchCustomizeTableResponseType) => {
      onSuccess(response.id);
    },
    onError: (error) => {
      console.error('Error starting customize debate:', error);
    },
  });
}
