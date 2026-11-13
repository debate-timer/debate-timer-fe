import { useTranslation } from 'react-i18next';
import { UsingOrganization } from '../constants/usingOrganizations';
import Marquee from './Marquee';

const ORGANIZATION_ITEM =
  'flex min-w-28 flex-none flex-col items-center gap-2 px-2 py-2 md:min-w-40 md:gap-3 md:px-4';
const LOGO_PLACEHOLDER =
  'flex size-12 items-center justify-center rounded-2xl bg-white text-ui-title text-neutral-400 md:size-16';

interface UsingOrganizationsSectionProps {
  organizations: UsingOrganization[];
}

export default function UsingOrganizationsSection(
  props: UsingOrganizationsSectionProps,
) {
  const { organizations } = props;
  const { t } = useTranslation();
  const title = t('이미 많은 토론 현장에서 쓰고 있어요');

  return (
    <section className="flex w-full justify-center bg-neutral-100 py-12 md:py-20">
      <div className="flex w-full max-w-[1200px] flex-col items-center gap-6 md:gap-10">
        <h2 className="px-4 text-center text-[min(max(1.5rem,3vw),2.5rem)] leading-tight font-bold">
          {title}
        </h2>
        {/* 템플릿 단체 칩과 구분되도록 테두리 없이 로고·이름만 크게, 반대 방향으로 흘림 */}
        <Marquee label={title} isReversed>
          <ul className="flex gap-3">
            {organizations.map((organization) => (
              <li
                key={`${organization.affiliation ?? ''}-${organization.name}`}
                className={ORGANIZATION_ITEM}
              >
                {organization.logo ? (
                  <img
                    src={organization.logo}
                    alt=""
                    className="h-12 w-20 object-contain md:h-16 md:w-28"
                  />
                ) : (
                  <span aria-hidden="true" className={LOGO_PLACEHOLDER}>
                    {organization.name.charAt(0)}
                  </span>
                )}
                <span className="text-sm font-semibold whitespace-nowrap text-neutral-700 md:text-ui-label">
                  {organization.affiliation && (
                    <span className="text-neutral-500">
                      {organization.affiliation}{' '}
                    </span>
                  )}
                  {organization.name}
                </span>
              </li>
            ))}
          </ul>
        </Marquee>
      </div>
    </section>
  );
}
