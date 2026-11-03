import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useGetOrganizationTemplates } from '../../../hooks/query/useGetOrganizationTemplates';
import useAnalytics from '../../../hooks/useAnalytics';
import ErrorIndicator from '../../../components/ErrorIndicator/ErrorIndicator';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { buildLangPath, getSelectedLang } from '../../../util/languageRouting';
import { createTemplateShareUrl } from '../../../util/templateShareUrl';

interface MarqueeItem {
  organizationName: string;
  iconPath: string;
  name: string;
  data: string;
}

const CHIP =
  'flex flex-none items-center gap-2.5 rounded-full border border-neutral-300 bg-white py-2.5 pr-4.5 pl-2.5 transition-colors hover:border-neutral-900';

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

  const renderChips = (isDuplicate: boolean) =>
    items.map((item) => (
      <a
        key={`${item.organizationName}-${item.name}`}
        href={createTemplateShareUrl(item.organizationName, item)}
        className={CHIP}
        tabIndex={isDuplicate ? -1 : undefined}
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
            className="size-10 flex-none rounded-full object-contain"
          />
        ) : (
          <span className="size-10 flex-none rounded-full bg-neutral-100" />
        )}
        <span className="flex flex-col">
          <span className="text-ui-label whitespace-nowrap">
            {item.organizationName}
          </span>
          <span className="text-ui-caption whitespace-nowrap text-neutral-600">
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
    // 끊김 없이 흐르도록 목록을 두 번 이어 붙이고, 두 번째 묶음은 보조 기술에서 숨긴다.
    return (
      <div className="w-full overflow-hidden py-1">
        <div className="flex w-max animate-marquee gap-3 motion-reduce:animate-none">
          <div className="flex gap-3">{renderChips(false)}</div>
          <div className="flex gap-3" aria-hidden="true">
            {renderChips(true)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-3 flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-ui-title">{t('토론 템플릿')}</h4>
        <Link
          to={buildLangPath('/templates', lang)}
          className="px-1 py-2.5 text-ui-label hover:text-neutral-600"
          aria-label={t('전체보기')}
        >
          {t('전체보기')} →
        </Link>
      </div>
      {renderBody()}
      <p className="text-ui-caption text-neutral-500">
        {t('* 각 단체의 사용 여부와는 관계없어요')}
      </p>
    </div>
  );
}
