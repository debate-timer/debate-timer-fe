import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import GoogleButton from '../../components/GoogleButton';

export default function LoginPage() {
  const AuthLogin = () => {
    if (
      !import.meta.env.VITE_GOOGLE_O_AUTH_CLIENT_ID ||
      !import.meta.env.VITE_GOOGLE_O_AUTH_REDIRECT_URI
    ) {
      throw new Error('OAuth 정보가 없습니다.');
    }

    const params = {
      client_id: import.meta.env.VITE_GOOGLE_O_AUTH_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_GOOGLE_O_AUTH_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid profile email',
    };
    const queryString = new URLSearchParams(params).toString();
    const googleOAuthUrl = `${import.meta.env.VITE_GOOGLE_O_AUTH_REQUEST_URL}?${queryString}`;

    window.location.href = googleOAuthUrl;
  };

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
