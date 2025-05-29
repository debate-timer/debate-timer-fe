import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import GoogleButton from '../../components/GoogleButton';
import { AuthLogin } from '../../util/googleAuth';

export default function LoginPage() {
  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>
          <div className="md:text-3xl flex flex-wrap items-center text-2xl font-bold">
            <h1 className="mr-2">로그인 페이지</h1>
          </div>
        </DefaultLayout.Header.Left>
      </DefaultLayout.Header>
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="pb-48">
          <h1 className="text-6xl font-semibold">Debate Timer</h1>
        </div>
        <section className="flex w-72 flex-col gap-8 text-lg font-semibold">
          <GoogleButton onClick={AuthLogin} />
        </section>
      </div>
    </DefaultLayout>
  );
}
