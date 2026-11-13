import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useGetOrganizationTemplates } from '../../../hooks/query/useGetOrganizationTemplates';
import useAnalytics from '../../../hooks/useAnalytics';
import ErrorIndicator from '../../../components/ErrorIndicator/ErrorIndicator';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { buildLangPath, getSelectedLang } from '../../../util/languageRouting';
import { createTemplateShareUrl } from '../../../util/templateShareUrl';
import Marquee from './Marquee';

interface MarqueeItem {
  organizationName: string;
  iconPath: string;
  name: string;
  data: string;
}

const CHIP =
  'flex flex-none items-center gap-2 rounded-full border border-neutral-300 bg-white py-1.5 pr-3.5 pl-1.5 transition-colors hover:border-neutral-900 md:gap-2.5 md:py-2.5 md:pr-4.5 md:pl-2.5';
const CHIP_ICON = 'size-8 flex-none rounded-full md:size-10';

export default function TemplateMarquee() {
  const { t, i18n } = useTranslation();
  const { trackEvent } = useAnalytics();
  const { data, isError } = useGetOrganizationTemplates();
  const lang = getSelectedLang(i18n.resolvedLanguage ?? i18n.language);

  const items: MarqueeItem[] =
    data?.organizations.flatMap((organization) =>
      organization.templates.map((template) => ({
        organizationName: organization.organization,
        iconPath: organization.iconPath,
        ...template,
      })),
    ) ?? [];

  const renderChips = () =>
    items.map((item) => (
      <a
        key={`${item.organizationName}-${item.name}`}
        href={createTemplateShareUrl(item.organizationName, item)}
        className={CHIP}
        aria-label={t('{{label}} 토론하기', { label: item.name })}
        onClick={() =>
          trackEvent('template_selected', {
            organization_name: item.organizationName,
            template_name: item.name,
            template_label: `${item.organizationName} - ${item.name}`,
          })
        }
      >
        {item.iconPath ? (
          <img
            src={import.meta.env.VITE_API_BASE_URL + item.iconPath}
            alt=""
            className={`${CHIP_ICON} object-contain`}
          />
        ) : (
          <span className={`${CHIP_ICON} bg-neutral-100`} />
        )}
        <span className="flex flex-col">
          <span className="text-sm font-semibold whitespace-nowrap md:text-ui-label">
            {item.organizationName}
          </span>
          <span className="text-xs whitespace-nowrap text-neutral-600 md:text-ui-caption">
            {item.name}
          </span>
        </span>
      </a>
    ));

  const renderBody = () => {
    if (isError) {
      return (
        <ErrorIndicator>
          {t('템플릿을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')}
        </ErrorIndicator>
      );
    }
    if (!data) {
      return (
        <div className="flex justify-center py-4">
          <LoadingSpinner
            strokeWidth={3}
            size={'size-10'}
            color={'text-default-disabled-hover'}
          />
        </div>
      );
    }
    return <Marquee label={t('토론 템플릿')}>{renderChips()}</Marquee>;
  };

  return (
    <div className="mt-3 flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-ui-label md:text-ui-title">{t('토론 템플릿')}</h4>
        <Link
          to={buildLangPath('/templates', lang)}
          className="px-1 py-2.5 text-ui-label hover:text-neutral-600"
          aria-label={t('전체보기')}
        >
          {t('전체보기')} →
        </Link>
      </div>
      {renderBody()}
    </div>
  );
}
