import { useTranslation } from 'react-i18next';
import { UsingOrganization } from '../constants/usingOrganizations';
import Marquee from './Marquee';

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
    <section className="flex w-full justify-center bg-neutral-100 py-20">
      <div className="flex w-full max-w-[1200px] flex-col items-center gap-10">
        <h2 className="px-4 text-center text-[min(max(1.5rem,3vw),2.5rem)] leading-tight font-bold">
          {title}
        </h2>
        {/* 템플릿 단체 칩과 구분되도록 테두리 없이 로고·이름만 크게, 반대 방향으로 흘림 */}
        <Marquee label={title} isReversed>
          <ul className="flex gap-3">
            {organizations.map((organization) => (
              <li
                key={organization.name}
                className="flex w-40 flex-none flex-col items-center gap-3 px-4 py-2"
              >
                {organization.logo ? (
                  <img
                    src={organization.logo}
                    alt=""
                    className="size-16 object-contain"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex size-16 items-center justify-center rounded-2xl bg-white text-ui-title text-neutral-400"
                  >
                    {organization.name.charAt(0)}
                  </span>
                )}
                <span className="max-w-full truncate text-ui-label text-neutral-700">
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
