import { useQuery } from '@tanstack/react-query';
import { getChairmanToken } from '../../apis/apis/share';

export default function useGetChairmanToken(
  tableId: string,
  enabled: boolean = false,
) {
  return useQuery({
    queryKey: ['chairmanToken', tableId],
    queryFn: async () => {
      const { data } = await getChairmanToken(tableId);
      return data.chairmanToken;
    },
    enabled,
    staleTime: Infinity,
  });
}
