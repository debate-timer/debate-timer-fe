import { useMutation } from '@tanstack/react-query';
import { postParliamentaryDebateTable } from '../../apis/apis';
import { DetailDebateInfo, TimeBoxInfo } from '../../type/type';
import { PostDebateTableResponseType } from '../../apis/responseTypes';

interface UseAddTableParams {
  info: DetailDebateInfo;
  table: TimeBoxInfo[];
}

export default function useAddTable(onSuccess: (id: number) => void) {
  return useMutation({
    mutationFn: async (params: UseAddTableParams) => {
      const response = await postParliamentaryDebateTable(
        params.tableName,
        params.tableAgenda,
        params.warningBell,
        params.finishBell,
        params.table,
      );
      return response;
    },
    onSuccess: (response: PostDebateTableResponseType) => {
      onSuccess(response.id);
    },
  });
}
