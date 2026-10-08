import { postVoterPollInfo } from '../../apis/apis/poll';
import { VoterPollInfo } from '../../types/type';
import { usePreventDuplicateMutation } from './usePreventDuplicateMutation';

export default function usePostVoterPollInfo(onSuccess: () => void) {
  return usePreventDuplicateMutation({
    mutationFn: ({
      pollId,
      voterInfo,
    }: {
      pollId: number;
      voterInfo: VoterPollInfo;
    }) => postVoterPollInfo(pollId, voterInfo),
    onSuccess: () => {
      onSuccess();
    },
  });
}
