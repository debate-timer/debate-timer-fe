import * as Sentry from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../../apis/apis/member';
import {
  getAuthRevision,
  removeAccessToken,
  removeMemberId,
} from '../../util/accessToken';
import { analyticsManager } from '../../util/analytics';
import { MEMBER_FEATURE_FLAGS_QUERY_KEY } from '../query/useGetMemberFeatureFlags';

/** 선택한 인증 revision에 결속해 토론 정리 중 계정이 바뀌면 로그아웃을 보내지 않음. */
export default function useLogout(
  onSuccess: () => void,
  options: { expectedAuthRevision?: number } = {},
) {
  const queryClient = useQueryClient();
  return useMutation({
    throwOnError: false,
    onMutate: () => getAuthRevision(),
    mutationFn: async () => {
      if (
        options.expectedAuthRevision !== undefined &&
        options.expectedAuthRevision !== getAuthRevision()
      ) {
        throw new Error('ACCOUNT_CHANGED');
      }
      const response = await logout();
      if (!response) {
        throw new Error('LOGOUT_FAILED');
      }
      return response;
    },
    onSuccess: (_data, _variables, revision) => {
      if (revision !== getAuthRevision()) {
        return;
      }
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
