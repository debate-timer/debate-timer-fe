import { useMutation } from '@tanstack/react-query';
import { PostUserResponseType } from '../../apis/responses/member';
import { postUser } from '../../apis/apis/member';
import { setMemberId } from '../../util/accessToken';
import { analyticsManager } from '../../util/analytics';

export function usePostUser(onSuccess: (data: PostUserResponseType) => void) {
  return useMutation({
    mutationFn: (code: string) => postUser(code),
    onSuccess: (data) => {
      setMemberId(data.id);
      analyticsManager.setUserId(String(data.id));
      analyticsManager.setUserProperties({
        user_type: 'member',
        language: document.documentElement.lang || 'ko',
      });
      onSuccess(data);
    },
    onError: (error) => {
      console.error('User creation error:', error);
    },
  });
}
