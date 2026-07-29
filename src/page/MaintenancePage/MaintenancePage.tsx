import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import StartButton from '../../components/StartButton/StartButton';
import { SAMPLE_TABLE_DATA } from '../../constants/sample_table';
import {
  isGuestFlow,
  setSessionCustomizeTableData,
} from '../../util/sessionStorage';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../util/languageRouting';

const MAINTENANCE_DESCRIPTION =
  "죄송합니다. 나중에 다시 시도해주세요... 😭 대신, 오프라인 모드로 타이머를 사용해볼 수 있으니, 필요하신 경우 '{{action}}' 버튼을 클릭해주세요.";

export default function MaintenancePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const hasGuestSession = isGuestFlow();
  const actionLabel = hasGuestSession
    ? t('오프라인으로 이어하기')
    : t('오프라인으로 시작하기');
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;

  const handleStartOffline = () => {
    if (!hasGuestSession) {
      setSessionCustomizeTableData(SAMPLE_TABLE_DATA);
    }

    navigate(buildLangPath('/overview/customize/guest', lang));
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-default-white px-5 py-12">
      <section
        aria-labelledby="maintenance-title"
        className="sm:px-12 sm:py-20 flex w-full max-w-2xl flex-col items-center rounded-[28px] border border-neutral-300 bg-default-white px-6 py-14 text-center shadow-lg"
      >
        <p aria-hidden="true" className="mb-5 text-5xl">
          🛠️
        </p>
        <h1
          id="maintenance-title"
          className="sm:text-4xl text-3xl font-bold text-default-black"
        >
          {t('서비스 점검 중')}
        </h1>
        <p className="sm:text-lg sm:leading-8 mb-10 mt-5 max-w-xl break-keep text-base leading-7 text-neutral-700">
          {t(MAINTENANCE_DESCRIPTION, { action: actionLabel })}
        </p>
        <StartButton onClick={handleStartOffline}>{actionLabel}</StartButton>
      </section>
    </main>
  );
}
