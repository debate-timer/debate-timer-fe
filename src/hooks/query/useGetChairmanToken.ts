import { useQuery } from '@tanstack/react-query';
import { getChairmanToken } from '../../apis/apis/live';

export const chairmanTokenQueryKey = (tableId: string) =>
  ['chairmanToken', tableId] as const;

export default function useGetChairmanToken(
  tableId: string,
  enabled: boolean = false,
  identity?: { memberId: string | null; revision: number },
) {
  return useQuery({
    queryKey: [
      ...chairmanTokenQueryKey(tableId),
      ...(identity ? [identity.memberId, identity.revision] : []),
    ],
    queryFn: async () => {
      const data = await getChairmanToken(
        tableId,
        identity?.memberId
          ? {
              expectedMemberId: identity.memberId,
              expectedAuthRevision: identity.revision,
            }
          : {},
      );
      return data.chairmanToken;
    },
    enabled: enabled && Boolean(tableId),
    staleTime: Infinity,
    gcTime: identity ? 0 : undefined,
    throwOnError: false,
  });
}
