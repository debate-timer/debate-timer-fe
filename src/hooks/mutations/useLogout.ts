import * as Sentry from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../../apis/apis/member';
import { removeAccessToken, removeMemberId } from '../../util/accessToken';
import { analyticsManager } from '../../util/analytics';
import { MEMBER_FEATURE_FLAGS_QUERY_KEY } from '../query/useGetMemberFeatureFlags';

export default function useLogout(onSuccess: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await logout();
      return response;
    },
    onSuccess: () => {
      removeAccessToken();
      removeMemberId();
      // 다른 계정으로 로그인했을 때 이전 회원의 플래그를 쓰지 않도록 지운다.
      queryClient.removeQueries({ queryKey: MEMBER_FEATURE_FLAGS_QUERY_KEY });
      analyticsManager.reset();
      Sentry.setUser(null);
      onSuccess();
    },
  });
}
