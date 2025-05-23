import { useMutation } from '@tanstack/react-query';
import { DebateInfo, TimeBoxInfo } from '../../type/type';
import { postDebateTableData } from '../../apis/apis/customize';
import { PostDebateTableResponseType } from '../../apis/responses/customize';

interface AddDebateTableParams {
  info: DebateInfo;
  table: TimeBoxInfo[];
}

export default function useAddDebateTable(onSuccess: (id: number) => void) {
  return useMutation({
    mutationFn: async (params: AddDebateTableParams) => {
      const response = await postDebateTableData(
        {
          name: params.info.name,
          agenda: params.info.agenda,
          prosTeamName: params.info.prosTeamName,
          consTeamName: params.info.consTeamName,
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
