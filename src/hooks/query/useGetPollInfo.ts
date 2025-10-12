import { useQuery } from '@tanstack/react-query';
import { getPollInfo } from '../../apis/apis/poll';
import { GetPollResponseType } from '../../apis/responses/poll';

export function useGetPollInfo(
  pollId: number,
  options?: { refetchInterval?: number | false; enabled?: boolean },
) {
  return useQuery<GetPollResponseType>({
    queryKey: ['Poll', pollId],
    queryFn: () => getPollInfo(pollId),
    refetchInterval: options?.refetchInterval ?? false,
    enabled: options?.enabled,
  });
}
