import { useMutation } from '@tanstack/react-query';
import { PostDebateTableResponseType } from '../../apis/responses/customize';
import { getRepository } from '../../repositories/DebateTableRepository';
import { DebateTableData } from '../../type/type';

export default function useAddDebateTable(onSuccess: (id: number) => void) {
  return useMutation({
    mutationFn: async (params: DebateTableData) => {
      const repo = getRepository();
      return repo.saveTable(params);
    },
    onSuccess: (response: PostDebateTableResponseType) => {
      onSuccess(response.id);
    },
  });
}
