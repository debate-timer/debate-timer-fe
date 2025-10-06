import { patchEndPoll } from '../../apis/apis/poll';
import { PatchPollResponseType } from '../../apis/responses/poll';
import { usePreventDuplicateMutation } from './usePreventDuplicateMutation';

export default function useFetchEndpoll(onSuccess: (id: number) => void) {
  return usePreventDuplicateMutation({
    mutationFn: (pollId: number) => patchEndPoll(pollId),
    onSuccess: (response: PatchPollResponseType) => {
      onSuccess(response.id);
    },
  });
}
