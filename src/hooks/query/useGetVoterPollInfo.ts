import { useQuery } from '@tanstack/react-query';
import { getVoterPollInfo } from '../../apis/apis/poll';

export function useGetVoterPollInfo(
  pollId: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['VoterPoll', pollId],
    queryFn: () => getVoterPollInfo(pollId),
    enabled: options?.enabled,
  });
}
