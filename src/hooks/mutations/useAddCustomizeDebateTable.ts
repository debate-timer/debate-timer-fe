import { useMutation } from '@tanstack/react-query';
import { CustomizeDebateInfo, CustomizeTimeBoxInfo } from '../../type/type';
import { postCustomizeTableData } from '../../apis/apis/customize';
import { PostCustomizeTableResponseType } from '../../apis/responses/customize';

interface UseAddCustomizeTableParams {
  info: CustomizeDebateInfo;
  table: CustomizeTimeBoxInfo[];
}

export default function useAddCustomizeTable(onSuccess: (id: number) => void) {
  return useMutation({
    mutationFn: async (params: UseAddCustomizeTableParams) => {
      const response = await postCustomizeTableData(
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
    onSuccess: (response: PostCustomizeTableResponseType) => {
      onSuccess(response.id);
    },
  });
}
