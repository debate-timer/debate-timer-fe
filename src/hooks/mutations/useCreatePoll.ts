import { postCreatePoll } from '../../apis/apis/poll';
import { PostCreatePollResponseType } from '../../apis/responses/poll';
import { usePreventDuplicateMutation } from './usePreventDuplicateMutation';

export default function useCreatePoll(onSuccess: (id: number) => void) {
  return usePreventDuplicateMutation({
    mutationFn: (id: number) => postCreatePoll(id),
    onSuccess: (response: PostCreatePollResponseType) => {
      onSuccess(response.id);
    },
  });
}
