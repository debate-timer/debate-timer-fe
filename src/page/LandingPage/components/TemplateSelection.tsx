import { DEBATE_TAMPLATE } from '../../../constants/debate_tamplate';
import TamplateList from './TamplateList';

export default function TemplateSelection() {
  return (
    <section id="template-selection" className="flex flex-col gap-12">
      <div>
        <div className="relative inline-block text-[min(max(0.875rem,1.5vw),1.4rem)] font-semibold">
          <span className="relative z-10">토론 시간표 템플릿 사용해보기</span>
          <span className="absolute bottom-0 left-0 z-0 h-4 w-full bg-brand/70"></span>
        </div>
        <h2 className="mt-4 text-left text-[min(max(1.25rem,2.75vw),2.5rem)] font-bold">
          학교/기관별 템플릿로
          <br className="sm:block hidden" /> 바로 시작하세요
        </h2>
      </div>
      <TamplateList data={DEBATE_TAMPLATE.ONE} />
      <div className="mx-auto h-px w-11/12 bg-neutral-200" /> {/* 구분선 */}
      <TamplateList data={DEBATE_TAMPLATE.TWO} />
      <div className="mx-auto h-px w-11/12 bg-neutral-200" />
      <TamplateList data={DEBATE_TAMPLATE.THREE} />
    </section>
  );
}
