import { postPoll } from '../../apis/apis/poll';
import { PostPollResponseType } from '../../apis/responses/poll';
import { usePreventDuplicateMutation } from './usePreventDuplicateMutation';

export default function usePostPoll(onSuccess: (id: number) => void) {
  return usePreventDuplicateMutation({
    mutationFn: (id: number) => postPoll(id),
    onSuccess: (response: PostPollResponseType) => {
      onSuccess(response.id);
    },
  });
}
