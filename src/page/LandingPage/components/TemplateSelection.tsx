import { DEBATE_TEMPLATE } from '../../../constants/debate_template';
import TamplateApplicationSection from './TamplateApplicationSection';
import TamplateList from './TamplateList';

export default function TemplateSelection() {
  return (
    <section id="template-selection" className="flex flex-col gap-12">
      <div>
        <h2 className="mt-4 text-left text-[min(max(1.25rem,2.75vw),2.5rem)] font-bold">
          다양한 토론 템플릿을 원클릭으로 만나보세요!
        </h2>
      </div>
      <TamplateList data={DEBATE_TEMPLATE.ONE} />
      <div className="mx-auto h-px w-11/12 bg-neutral-200" /> {/* 구분선 */}
      <TamplateList data={DEBATE_TEMPLATE.TWO} />
      <div className="mx-auto h-px w-11/12 bg-neutral-200" />
      <TamplateList data={DEBATE_TEMPLATE.THREE} />
      <TamplateApplicationSection />
    </section>
  );
}
