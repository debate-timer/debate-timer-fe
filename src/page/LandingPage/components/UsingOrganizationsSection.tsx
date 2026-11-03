import { useTranslation } from 'react-i18next';
import { UsingOrganization } from '../constants/usingOrganizations';

interface UsingOrganizationsSectionProps {
  organizations: UsingOrganization[];
}

export default function UsingOrganizationsSection(
  props: UsingOrganizationsSectionProps,
) {
  const { organizations } = props;
  const { t } = useTranslation();

  return (
    <section className="flex w-full justify-center bg-neutral-100 px-4 py-20">
      <div className="flex w-full max-w-[1200px] flex-col items-center gap-10">
        <h2 className="text-center text-[min(max(1.5rem,3vw),2.5rem)] leading-tight font-bold">
          {t('이미 많은 토론 현장에서 쓰고 있어요')}
        </h2>
        <ul className="grid w-full grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {organizations.map((organization) => (
            <li
              key={organization.name}
              className="flex h-28 flex-col items-center justify-center gap-2.5 rounded-2xl bg-white px-3"
            >
              {organization.logo ? (
                <img
                  src={organization.logo}
                  alt=""
                  className="size-11 object-contain"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex size-11 items-center justify-center rounded-xl bg-neutral-100 text-ui-label text-neutral-500"
                >
                  {organization.name.charAt(0)}
                </span>
              )}
              <span className="truncate text-ui-caption text-neutral-700">
                {organization.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
