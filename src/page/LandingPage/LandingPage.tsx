import Header from './components/Header';
import MainSection from './components/MainSection';
import TimeTableSection from './components/TimeTableSection';
import TimerSection from './components/TimerSection';
import TableSection from './components/TableSection';
import ReviewSection from './components/ReviewSection';
import ReportSection from './components/ReportSection';
import useLandingPageHandlers from './hooks/useLandingPageHandlers';

export default function LandingPage() {
  const {
    handleStartWithoutLogin,
    handleDashboardButtonClick,
    handleHeaderLoginButtonClick,
    handleTableSectionLoginButtonClick,
  } = useLandingPageHandlers();

  return (
    <div className="flex h-full w-full items-center justify-center bg-default-white">
      {/* 헤더 */}
      <Header onLoginButtonClicked={handleHeaderLoginButtonClick} />

      <main className="flex w-full flex-col items-center">
        {/* 흰색 배경 */}
        <div className="flex w-[95%] max-w-[1226px] flex-col gap-96 pb-48 pt-20 md:w-[64%]">
          {/* 메인 화면 */}
          <MainSection
            onStartWithoutLogin={handleStartWithoutLogin}
            onDashboardButtonClicked={handleDashboardButtonClick}
          />
          {/* 시간표 설정화면 */}
          <TimeTableSection />
        </div>

        {/* 회색 배경 */}
        <div className="flex w-full flex-col items-center bg-default-disabled/hover py-48">
          {/* 타이머 화면 */}
          <TimerSection />
        </div>

        {/* 흰색 배경 */}
        <div className="flex w-[95%] max-w-[1226px] flex-col gap-96 py-48 md:w-[64%]">
          {/* 홈 설정 */}
          <TableSection onLogin={handleTableSectionLoginButtonClick} />
          {/* 리뷰 */}
          <ReviewSection onStartWithoutLogin={handleStartWithoutLogin} />
          {/* 버그 및 불편사항 제보 */}
          <ReportSection />
        </div>
      </main>
    </div>
  );
}
