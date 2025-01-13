import { useMutation } from '@tanstack/react-query';
import { request } from '../../apis/primitives';
import { AxiosError } from 'axios';

interface LoginResponseType {
  id: number;
  nickname: string;
}

export default function useLoginUser() {
  return useMutation<
    LoginResponseType,
    AxiosError<{ message: string }>,
    { nickname: string }
  >({
    mutationFn: async (data) => {
      const response = await request<LoginResponseType>(
        'POST',
        '/member',
        data,
        null,
      );
      return response.data;
    },
    onSuccess: (data) => {
      console.log('로그인 성공:', data);
      alert(`환영합니다, ${data.nickname}님!`);
    },
    onError: (error) => {
      console.error(
        '로그인 실패:',
        error.response?.data?.message || '알 수 없는 에러',
      );
    },
  });
}
