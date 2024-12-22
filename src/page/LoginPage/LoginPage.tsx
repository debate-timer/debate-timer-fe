import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import LinkButton from './components/LinkButton';

export default function LoginPage() {
  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>헤더</DefaultLayout.Header.Left>
        <DefaultLayout.Header.Center>의회식</DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right>제목</DefaultLayout.Header.Right>
      </DefaultLayout.Header>
      <div className="flex flex-col h-screen items-center justify-center">
        <div className="pb-[200px]">
          <h1 className="text-[70px] font-semibold">Debate Timer</h1>
        </div>
        <section className="w-[300px] text-lg flex flex-col gap-8">
          <input
            placeholder="닉네임을 입력해주세요"
            className="text-center bg-slate-300 placeholder:text-black p-5 rounded-lg"
          />
          <LinkButton />
        </section>
      </div>
    </DefaultLayout>
  );
}
