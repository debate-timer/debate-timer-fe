import { useTranslation } from 'react-i18next';
import { DEBATE_TEMPLATE } from '../../../constants/debate_template';
import TemplateApplicationSection from './TemplateApplicationSection';
import TemplateList from './TemplateList';

export default function TemplateSelection() {
  const { t } = useTranslation();
  return (
    <section id="template-selection" className="flex flex-col gap-12">
      <div>
        <h2 className="mt-4 text-left text-[min(max(1.25rem,2.75vw),2.5rem)] font-bold">
          {t('다양한 토론 템플릿을 원클릭으로 만나보세요!')}
        </h2>
      </div>
      <TemplateList data={DEBATE_TEMPLATE.ONE} />
      <div className="mx-auto h-px w-11/12 bg-neutral-200" /> {/* 구분선 */}
      <TemplateList data={DEBATE_TEMPLATE.TWO} />
      <div className="mx-auto h-px w-11/12 bg-neutral-200" />
      <TemplateList data={DEBATE_TEMPLATE.THREE} />
      <TemplateApplicationSection />
    </section>
  );
}
