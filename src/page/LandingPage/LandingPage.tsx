import Header from './components/Header';
import MainSection from './components/MainSection';
import TimeTableSection from './components/TimeTableSection';
import TimerSection from './components/TimerSection';
import TableSection from './components/TableSection';
import ReviewSection from './components/ReviewSection';
import ReportSection from './components/ReportSection';

export default function LandingPage() {
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

  const handleStartWithoutLogin = () => {
    alert('비회원으로 시작하기');
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-neutral-0">
      {/* 헤더 */}
      <Header onLogin={AuthLogin} />

      <main className="flex w-full flex-col items-center">
        {/* 흰색 배경 */}
        <div className="flex w-[64%] max-w-[1226px] flex-col gap-96 pb-48 pt-20">
          {/* 메인 화면 */}
          <MainSection onStartWithoutLogin={handleStartWithoutLogin} />
          {/* 시간표 설정화면 */}
          <TimeTableSection />
        </div>

        {/* 회색 배경 */}
        <div className="flex w-full flex-col items-center bg-background-dark py-48">
          {/* 타이머 화면 */}
          <TimerSection />
        </div>

        {/* 흰색 배경 */}
        <div className="flex w-[64%] max-w-[1226px] flex-col gap-96 py-48">
          {/* 홈 설정 */}
          <TableSection onLogin={AuthLogin} />
          {/* 리뷰 */}
          <ReviewSection onStartWithoutLogin={handleStartWithoutLogin} />
          {/* 버그 및 불편사항 제보 */}
          <ReportSection />
        </div>
      </main>
    </div>
  );
}
