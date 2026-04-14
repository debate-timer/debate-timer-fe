import { useMutation } from '@tanstack/react-query';
import { logout } from '../../apis/apis/member';
import { removeAccessToken, removeMemberId } from '../../util/accessToken';
import { analyticsManager } from '../../util/analytics';

export default function useLogout(onSuccess: () => void) {
  return useMutation({
    mutationFn: async () => {
      const response = await logout();
      return response;
    },
    onSuccess: () => {
      removeAccessToken();
      removeMemberId();
      analyticsManager.reset();
      onSuccess();
    },
  });
}
