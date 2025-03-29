import { useMutation } from '@tanstack/react-query';
import { postParliamentaryDebateTable } from '../../apis/apis/parliamentary';
import { DetailDebateInfo, ParliamentaryTimeBoxInfo } from '../../type/type';
import { PostDebateTableResponseType } from '../../apis/responses/parliamentary';

interface UseAddTableParams {
  info: DetailDebateInfo;
  table: ParliamentaryTimeBoxInfo[];
}

export default function useAddTable(onSuccess: (id: number) => void) {
  return useMutation({
    mutationFn: async (params: UseAddTableParams) => {
      const response = await postParliamentaryDebateTable(
        {
          name: params.info.name,
          agenda: params.info.agenda,
          warningBell: params.info.warningBell,
          finishBell: params.info.finishBell,
        },
        params.table,
      );
      return response;
    },
    onSuccess: (response: PostDebateTableResponseType) => {
      onSuccess(response.id);
    },
  });
}
