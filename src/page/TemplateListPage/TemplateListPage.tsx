import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import GeneralHeaderContainer from '../../layout/components/header/GeneralHeaderContainer';
import TemplateCard from './components/TemplateCard';
import ErrorIndicator from '../../components/ErrorIndicator/ErrorIndicator';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import useGetOrganizationTemplates from '../../hooks/query/useGetOrganizationTemplates';
import { LANDING_URLS } from '../../constants/urls';
import { buildLangPath, getSelectedLang } from '../../util/languageRouting';

const TEMPLATE_CATEGORIES = [
  {
    category: 'TOURNAMENT',
    title: '대회',
    description: '토론 대회에서 사용하는 형식으로 토론을 준비해 보세요.',
  },
  {
    category: 'DEBATE_CLUB',
    title: '동아리',
    description: '국내 토론 동아리에서 사용하는 다양한 토론 형식을 만나보세요.',
  },
  {
    category: 'GLOBAL',
    title: '글로벌 토론',
    description: '세계 여러 나라에서 사용하는 다양한 토론 형식을 만나보세요.',
  },
] as const;

/**
 * 서버 분류에 따라 대회·동아리·글로벌 토론 순으로 묶고 빈 구역은 숨김.
 * 각 구역은 번역된 제목·설명을 제공하고 응답의 복사본을 표시 언어 기준으로 정렬함.
 * 한국어는 한글→영문, 영어는 영문→한글순이며 조직 안의 템플릿 순서는 유지함.
 */
export default function TemplateListPage() {
  const { t, i18n } = useTranslation();
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
    const organizations = [...data.organizations].sort((a, b) =>
      a.organization.localeCompare(b.organization, lang, {
        sensitivity: 'base',
      }),
    );
    return (
      <div className="flex flex-col gap-12">
        {TEMPLATE_CATEGORIES.map(({ category, title, description }) => {
          const categoryOrganizations = organizations.filter(
            (organization) => organization.category === category,
          );
          if (categoryOrganizations.length === 0) {
            return null;
          }
          return (
            <section
              key={category}
              aria-labelledby={`template-category-${category}`}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <h2
                  id={`template-category-${category}`}
                  className="text-ui-title text-neutral-900"
                >
                  {t(title)}
                </h2>
                <p className="text-ui-body text-neutral-600">
                  {t(description)}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {categoryOrganizations.map((organization) => (
                  <TemplateCard
                    key={`${organization.organization}-${organization.affiliation}`}
                    organization={organization}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white">
      <div className="sticky top-0 z-30 w-full">
        <GeneralHeaderContainer />
      </div>
      <main className="flex w-full max-w-[1200px] flex-col gap-8 px-4 pt-8 pb-24">
        <Link
          to={buildLangPath('/', lang)}
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
          <Button
            variant="secondary"
            href={LANDING_URLS.TEMPLATE_REGISTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border-neutral-900!"
            aria-label={t('템플릿 문의하기')}
          >
            {t('템플릿 문의하기')}
          </Button>
        </div>
        {renderTemplates()}
      </main>
    </div>
  );
}
