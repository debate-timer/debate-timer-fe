import { PostDebateTableResponseType } from '../../apis/responses/debateTable';
import { getRepository } from '../../repositories/DebateTableRepository';
import { DebateTableData } from '../../type/type';
import { usePreventDuplicateMutation } from './usePreventDuplicateMutation';

export default function useAddDebateTable(onSuccess: (id: number) => void) {
  return usePreventDuplicateMutation({
    mutationFn: async (params: DebateTableData) => {
      const repo = getRepository();
      return repo.addTable(params);
    },
    onSuccess: (response: PostDebateTableResponseType) => {
      onSuccess(response.id);
    },
  });
}
