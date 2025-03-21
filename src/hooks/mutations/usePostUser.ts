import { useMutation } from '@tanstack/react-query';
import { PostUserResponseType } from '../../apis/responseTypes';
import { postUser } from '../../apis/apis';

export function usePostUser(onSuccess: (data: PostUserResponseType) => void) {
  return useMutation({
    mutationFn: (code: string) => postUser(code),
    onSuccess,
    onError: (error) => {
      console.error('User creation error:', error);
    },
  });
}
