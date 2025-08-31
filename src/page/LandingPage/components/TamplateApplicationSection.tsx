import section501 from '../../../assets/landing/section5-1.png';
import { LANDING_URLS } from '../../../constants/urls';
export default function TamplateApplicationSection() {
  return (
    <section className="flex flex-row justify-between gap-1">
      <div className="flex flex-col items-start justify-center gap-4">
        <p className="text-[min(max(1.2rem,2vw),2.3rem)] font-semibold">
          템플릿 신청하기
        </p>
        <p className="text-[min(max(0.875rem,1.25vw),1.2rem)] text-neutral-400">
          새로운 템플릿도 신청해볼까요?
        </p>
        <button
          onClick={() =>
            window.open(
              LANDING_URLS.REPORT_FORM_URL,
              '_blank',
              'noopener,noreferrer',
            )
          }
          className="rounded-full border border-neutral-300 bg-neutral-200 px-9 py-2 text-[min(max(0.875rem,1.25vw),1.2rem)] font-medium text-default-black transition-all duration-100 hover:bg-brand"
        >
          신청하기
        </button>
      </div>
      <img src={section501} alt="section501" className="w-[30%]" />
    </section>
  );
}
