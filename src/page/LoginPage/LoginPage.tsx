import { useState } from 'react';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { useNavigate } from 'react-router-dom';
import { usePostUser } from '../../hooks/mutations/usePostUser';
import { setMemberIdToken } from '../../util/memberIdToken';

export default function LoginPage() {
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();
  const { mutate } = usePostUser((data) => {
    setMemberIdToken(data.id);
    navigate('/table');
  });

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };

  const handleLogin = () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }
    mutate(nickname);
  };
  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>헤더</DefaultLayout.Header.Left>
        <DefaultLayout.Header.Center>의회식</DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right>제목</DefaultLayout.Header.Right>
      </DefaultLayout.Header>
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="pb-48">
          <h1 className="text-6xl font-semibold">Debate Timer</h1>
        </div>
        <section className="flex w-72 flex-col gap-8 text-lg font-semibold">
          <input
            id="nickname"
            value={nickname}
            onChange={handleNicknameChange}
            placeholder="닉네임을 입력해주세요"
            className="rounded-lg bg-slate-300 p-5 text-center placeholder-slate-500"
          />
          <button
            onClick={handleLogin}
            className="rounded-lg bg-amber-300 p-5 transition-transform duration-200 hover:scale-105"
          >
            로그인
          </button>
        </section>
      </div>
    </DefaultLayout>
  );
}
