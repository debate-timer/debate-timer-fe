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
