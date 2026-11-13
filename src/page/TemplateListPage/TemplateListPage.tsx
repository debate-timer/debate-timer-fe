import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Header from '../LandingPage/components/Header';
import useLandingPageHandlers from '../LandingPage/hooks/useLandingPageHandlers';
import TemplateCard from '../../components/TemplateCard/TemplateCard';
import ErrorIndicator from '../../components/ErrorIndicator/ErrorIndicator';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { useGetOrganizationTemplates } from '../../hooks/query/useGetOrganizationTemplates';
import { LANDING_URLS } from '../../constants/urls';
import { buildLangPath, getSelectedLang } from '../../util/languageRouting';

const INQUIRY_BUTTON =
  'rounded-full border border-neutral-900 bg-white px-5 py-3 text-ui-label transition-colors hover:bg-neutral-100';

export default function TemplateListPage() {
  const { t, i18n } = useTranslation();
  const { handleHeaderLoginButtonClick } = useLandingPageHandlers();
  const { data, isError } = useGetOrganizationTemplates();
  const lang = getSelectedLang(i18n.resolvedLanguage ?? i18n.language);

  const renderTemplates = () => {
    if (isError) {
      return (
        <ErrorIndicator>
          {t('템플릿을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')}
        </ErrorIndicator>
      );
    }
    if (!data) {
      return (
        <div className="flex flex-col items-center gap-2 py-12">
          <LoadingSpinner
            size={'size-24'}
            color={'text-default-disabled-hover'}
          />
          <p className="text-ui-caption text-neutral-500">
            {t('템플릿을 불러오는 중입니다...')}
          </p>
        </div>
      );
    }
    // 한 행의 카드 높이가 비슷하도록 템플릿이 적은 단체부터 보여 줌. 개수가 같으면 서버 순서를 유지함
    const organizations = [...data.organizations].sort(
      (a, b) => a.templates.length - b.templates.length,
    );

    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((organization) => (
          <TemplateCard
            key={`${organization.organization}-${organization.affiliation}`}
            organization={organization}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full justify-center bg-default-white">
      {/* TODO: 헤더 개편이 반영되면 공용 헤더로 교체함 */}
      <Header onLoginButtonClicked={handleHeaderLoginButtonClick} />
      <main className="flex w-full max-w-[1200px] flex-col gap-8 px-4 pt-28 pb-24">
        <Link
          to={buildLangPath('/home', lang)}
          className="self-start py-2 text-ui-label text-neutral-600 hover:text-neutral-900"
          aria-label={t('메인으로')}
        >
          ← {t('메인으로')}
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <h1 className="text-ui-headline">{t('토론 템플릿')}</h1>
            <p className="text-ui-body text-neutral-600">
              {t(
                '단체별 토론 형식을 골라 바로 시작하세요. 로그인하면 내 시간표로 저장하고 고쳐 쓸 수 있어요.',
              )}
            </p>
          </div>
          <a
            href={LANDING_URLS.TEMPLATE_REGISTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={INQUIRY_BUTTON}
            aria-label={t('템플릿 문의하기')}
          >
            {t('템플릿 문의하기')}
          </a>
        </div>
        {renderTemplates()}
      </main>
    </div>
  );
}
