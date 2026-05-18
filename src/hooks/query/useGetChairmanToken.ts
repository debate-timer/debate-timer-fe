import { useQuery } from '@tanstack/react-query';
import { getChairmanToken } from '../../apis/apis/share';

export const chairmanTokenQueryKey = (tableId: string) =>
  ['chairmanToken', tableId] as const;

export default function useGetChairmanToken(
  tableId: string,
  enabled: boolean = false,
) {
  return useQuery({
    queryKey: chairmanTokenQueryKey(tableId),
    queryFn: async () => {
      const { data } = await getChairmanToken(tableId);
      return data.chairmanToken;
    },
    enabled: enabled && Boolean(tableId),
    staleTime: Infinity,
  });
}
