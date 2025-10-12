import { useQuery } from '@tanstack/react-query';
import { getVoterPollInfo } from '../../apis/apis/poll';
import { GetVoterPollInfoResponseType } from '../../apis/responses/poll';

export function useGetVoterPollInfo(
  pollId: number,
  options?: { enabled?: boolean },
) {
  return useQuery<GetVoterPollInfoResponseType>({
    queryKey: ['VoterPoll', pollId],
    queryFn: () => getVoterPollInfo(pollId),
    enabled: options?.enabled,
  });
}
