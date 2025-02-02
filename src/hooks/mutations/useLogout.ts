import { useMutation } from '@tanstack/react-query';
import { logout } from '../../apis/apis';

export default function useLogout(onSuccess: () => void) {
  return useMutation({
    mutationFn: async () => {
      const response = await logout();
      return response;
    },
    onSuccess,
  });
}
