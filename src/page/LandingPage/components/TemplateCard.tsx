import { useTranslation } from 'react-i18next';
import { Organization } from '../../../type/type';
import clsx from 'clsx';

interface TemplateCardProps {
  organization: Organization;
  className?: string; // 카드의 추가 className이 필요하면 사용
}

export default function TemplateCard({
  organization,
  className = '',
}: TemplateCardProps) {
  const { t } = useTranslation();
  const logoUrl = import.meta.env.VITE_API_BASE_URL + organization.iconPath;

  return (
    <article
      className={clsx(
        'flex flex-col rounded-3xl border-4 border-white bg-gradient-to-b from-default-white to-brand',
        'ring-3 ring-brand/20',
        'p-6 shadow-[0_0_32px_rgba(255,165,0,0.1)] md:p-7',
        className,
      )}
    >
      {/* 헤더 */}
      <div className="flex justify-between">
        <div className="flex flex-col gap-2">
          <h3 className="text-[min(max(0.9rem,1.4vw),1.1rem)] font-semibold leading-tight">
            {organization.organization}
          </h3>
          <p className="mt-1 min-h-[1.25rem] text-[min(max(0.75rem,1.1vw),0.9rem)] text-neutral-700">
            {organization.affiliation}
          </p>
        </div>

        {/* 로고 */}
        {organization.iconPath && (
          <img
            src={logoUrl}
            alt={t('{{title}} 로고', { title: organization.organization })}
            className="h-12 w-12 shrink-0 object-contain"
          />
        )}
      </div>

      {/* 액션 리스트 */}
      <ul className="mt-5 flex flex-col gap-1">
        {organization.templates.map((template, index) => (
          <li key={`${template.name}-${index}`}>
            <div className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2">
              <span className="truncate text-[min(max(0.75rem,1.1vw),0.9rem)] font-medium text-neutral-800">
                {template.name}
              </span>

              <a
                href={createTableShareUrl(template.data)}
                className="shrink-0 rounded-full border border-neutral-300 bg-brand px-4 py-1.5 text-[min(max(0.75rem,1.1vw),0.9rem)] font-medium text-default-black transition-colors duration-100 hover:bg-semantic-table hover:text-white"
                aria-label={t('{{label}} 토론하기', { label: template.name })}
              >
                {t('토론하기')}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

function createTableShareUrl(encodeData: string): string {
  const baseUrl = import.meta.env.VITE_SHARE_BASE_URL || window.location.origin;
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const basePath = import.meta.env.VITE_BASE_PATH;
  const pathPrefix = basePath && basePath !== '/' ? basePath : '';
  return `${normalizedBaseUrl}${pathPrefix}/share?data=${encodeData}`;
}
