import { useTranslation } from 'react-i18next';
import TemplateApplicationSection from './TemplateApplicationSection';
import TemplateList from './TemplateList';
import { useGetOrganizationTemplates } from '../../../hooks/query/useGetOrganizationTemplates';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function TemplateSelection() {
  const { t } = useTranslation();
  const { data } = useGetOrganizationTemplates();

  return (
    <section id="template-selection" className="flex flex-col gap-12">
      <div>
        <h2 className="mt-4 text-left text-[min(max(1.25rem,2.75vw),2.5rem)] font-bold">
          {t('다양한 토론 템플릿을 원클릭으로 만나보세요!')}
        </h2>
      </div>
      {data ? (
        <>
          <TemplateList
            key={`${data.organizations[0].organization}-${data.organizations[0].templates[0].name}`}
            organizations={data.organizations.filter(
              (orgs) => orgs.templates.length == 1,
            )}
          />
          <div className="mx-auto h-px w-11/12 bg-neutral-200" />
          <TemplateList
            key={`${data.organizations[1].organization}-${data.organizations[1].templates[0].name}`}
            organizations={data.organizations.filter(
              (orgs) => orgs.templates.length == 2,
            )}
          />
          <div className="mx-auto h-px w-11/12 bg-neutral-200" />
          <TemplateList
            key={`${data.organizations[2].organization}-${data.organizations[2].templates[0].name}`}
            organizations={data.organizations.filter(
              (orgs) => orgs.templates.length >= 3,
            )}
          />
        </>
      ) : (
        <div className="flex w-full flex-col items-center justify-center space-y-[8px]">
          <LoadingSpinner
            strokeWidth={3}
            size={'size-24'}
            color={'text-default-disabled/hover'}
          />
          <p className="text-center text-gray-500">
            {t('템플릿을 불러오는 중입니다...')}
          </p>
        </div>
      )}
      <TemplateApplicationSection />
    </section>
  );
}
