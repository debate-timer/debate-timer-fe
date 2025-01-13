import { useState } from 'react';

export default function LoginPage() {
  const [nickname, setNickname] = useState('');

  const handleLogin = () => {
    if (!nickname) {
      alert('닉네임을 입력해주세요.');
      return;
    }
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
