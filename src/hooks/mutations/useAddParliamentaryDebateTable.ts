import { useMutation } from '@tanstack/react-query';
import { postParliamentaryDebateTable } from '../../apis/apis/parliamentary';
import {
  ParliamentaryDebateInfo,
  ParliamentaryTimeBoxInfo,
} from '../../type/type';
import { PostDebateTableResponseType } from '../../apis/responses/parliamentary';

interface UseAddParliamentaryTableParams {
  info: ParliamentaryDebateInfo;
  table: ParliamentaryTimeBoxInfo[];
}

export default function useAddParliamentaryTable(
  onSuccess: (id: number) => void,
) {
  return useMutation({
    mutationFn: async (params: UseAddParliamentaryTableParams) => {
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
