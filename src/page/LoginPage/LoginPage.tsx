import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { request } from '../../apis/primitives';
import { AxiosError } from 'axios';

interface LoginResponseType {
  id: number;
  nickname: string;
}

export default function LoginPage() {
  const [nickname, setNickname] = useState('');

  const mutation = useMutation<
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

  const handleLogin = () => {
    if (!nickname) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    mutation.mutate({ nickname }); // Mutation 실행
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="pb-48">
        <h1 className="text-6xl font-semibold">Debate Timer</h1>
      </div>
      <section className="flex w-72 flex-col gap-8 text-lg font-semibold">
        <input
          id="nickname"
          placeholder="닉네임을 입력해주세요"
          className="rounded-lg bg-slate-300 p-5 text-center placeholder-slate-500"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        {mutation.isError && (
          <p className="text-center text-sm text-red-500">
            {mutation.error?.response?.data?.message ||
              '로그인 중 에러가 발생했습니다.'}
          </p>
        )}
        <button
          onClick={handleLogin}
          className="rounded-lg bg-blue-500 p-5 text-white hover:bg-blue-700"
        >
          로그인
        </button>
      </section>
    </div>
  );
}
