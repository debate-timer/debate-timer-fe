import { useMutation } from '@tanstack/react-query';
import { postParliamentaryDebateTable } from '../../apis/apis';
import { DebateInfo } from '../../type/type';
import { PostDebateTableResponseType } from '../../apis/responseTypes';

interface UseAddTableParams {
  tableName: string;
  tableAgenda: string;
  table: DebateInfo[];
}

export default function useAddTable(onSuccess: (id: number) => void) {
  return useMutation({
    mutationFn: async (params: UseAddTableParams) => {
      const response = await postParliamentaryDebateTable(
        params.tableName,
        params.tableAgenda,
        params.table,
      );
      return response;
    },
    onSuccess: (response: PostDebateTableResponseType) => {
      onSuccess(response.id);
    },
  });
}
