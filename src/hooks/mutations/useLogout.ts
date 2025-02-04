import { useMutation } from '@tanstack/react-query';
import { logout } from '../../apis/apis';
import { removeAccessToken } from '../../util/accessToken';

export default function useLogout(onSuccess: () => void) {
  return useMutation({
    mutationFn: async () => {
      const response = await logout();
      return response;
    },
    onSuccess: () => {
      removeAccessToken();
      onSuccess();
    },
  });
}
