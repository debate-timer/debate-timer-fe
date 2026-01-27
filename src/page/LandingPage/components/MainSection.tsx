import { useTranslation } from 'react-i18next';
import preview from '../../../assets/landing/preview.webm';
import { isLoggedIn } from '../../../util/accessToken';

interface MainSectionProps {
  onStartWithoutLogin: () => void;
  onDashboardButtonClicked: () => void;
}

export default function MainSection({
  onStartWithoutLogin,
  onDashboardButtonClicked,
}: MainSectionProps) {
  const { t } = useTranslation();
  return (
    <section
      id="main-section"
      className="flex flex-col items-center justify-center gap-12"
    >
      <video src={preview} autoPlay muted loop className="w-2/3">
        <p>{t('브라우저에서 비디오를 지원하지 않습니다.')}</p>
      </video>
      <h1 className="text-[min(max(1.5rem,3.5vw),3rem)] font-bold">
        {t('토론 진행을 더 쉽고 빠르게')}
      </h1>
      <button
        onClick={isLoggedIn() ? onDashboardButtonClicked : onStartWithoutLogin}
        className="rounded-full border border-neutral-300 bg-brand px-5 py-2 text-[min(max(0.875rem,1.25vw),1.2rem)] font-medium text-default-black transition-all duration-100 hover:bg-semantic-table hover:text-default-white"
      >
        {isLoggedIn() ? t('대시보드로 이동') : t('비회원으로 시작하기')}
      </button>
    </section>
  );
}
