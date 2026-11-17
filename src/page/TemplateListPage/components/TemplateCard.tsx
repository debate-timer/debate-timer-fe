import { useTranslation } from 'react-i18next';
import { Organization } from '../../../types/type';
import clsx from 'clsx';
import { IoArrowForwardSharp } from 'react-icons/io5';
import IconButton from '../../../components/IconButton/IconButton';
import { createTemplateShareUrl } from '../../../util/templateShareUrl';
import useAnalytics from '../../../hooks/useAnalytics';

const CARD_CONTAINER =
  'flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5';

const TEMPLATE_ROW =
  'flex items-center justify-between gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50 py-2 pr-2 pl-3.5';

const LOGO_IMAGE =
  'size-12 shrink-0 rounded-xl border border-neutral-100 bg-neutral-50 object-contain p-1.5 supports-[corner-shape:squircle]:rounded-[50%] [corner-shape:squircle]';

interface TemplateCardProps {
  organization: Organization;
  className?: string; // 카드의 추가 className이 필요하면 사용
}

/**
 * 단체별 템플릿 목록과 토론 시작 링크를 보여 주는 카드.
 * 단체 정보 왼쪽의 얇은 브랜드색 선으로 강조하고 로고와 목록은 중립색으로 유지함.
 * 템플릿을 고르면 `template_selected` 이벤트를 기록하고 공유 화면으로 이동함.
 */
export default function TemplateCard(props: TemplateCardProps) {
  const { organization, className = '' } = props;
  const { t } = useTranslation();
  const { trackEvent } = useAnalytics();
  const logoUrl = import.meta.env.VITE_API_BASE_URL + organization.iconPath;

  return (
    <article className={clsx(CARD_CONTAINER, className)}>
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1 border-l-[3px] border-brand/70 pl-3">
          <h3 className="text-ui-title wrap-break-word text-neutral-900">
            {organization.organization}
          </h3>
          {organization.affiliation && (
            <p className="text-ui-caption wrap-break-word text-neutral-500">
              {organization.affiliation}
            </p>
          )}
        </div>

        {/* 로고 */}
        {organization.iconPath && (
          <img
            src={logoUrl}
            alt={t('{{title}} 로고', { title: organization.organization })}
            className={LOGO_IMAGE}
          />
        )}
      </div>

      {/* 액션 리스트 */}
      <ul className="mt-4 flex flex-col gap-2">
        {organization.templates.map((template, index) => (
          <li key={`${template.name}-${index}`}>
            <div className={TEMPLATE_ROW}>
              <span className="min-w-0 text-ui-body wrap-break-word text-neutral-900">
                {template.name}
              </span>

              <IconButton
                href={createTemplateShareUrl(
                  organization.organization,
                  template,
                )}
                variant="neutral"
                shape="circle"
                className="size-[32px]"
                icon={<IoArrowForwardSharp aria-hidden />}
                aria-label={t('{{label}} 토론하기', { label: template.name })}
                onClick={() =>
                  trackEvent('template_selected', {
                    organization_name: organization.organization,
                    template_name: template.name,
                    template_label: `${organization.organization} - ${template.name}`,
                  })
                }
              />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
