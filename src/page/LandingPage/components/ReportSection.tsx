import section501 from '../../../assets/landing/section5-1.png';
import { LANDING_URLS } from '../../../constants/urls';

export default function ReportSection() {
  return (
    <section id="section5" className="flex flex-col gap-16">
      <div className="flex flex-row justify-between gap-1">
        <div className="flex flex-col items-start justify-center gap-4">
          <p className="text-[2vw] font-semibold">버그 및 불편사항 제보</p>
          <p className="text-[1.25vw] text-neutral-400">
            디베이트 타이머 사용 중 불편함을 느끼셨나요?
          </p>
          <button
            onClick={() =>
              window.open(
                LANDING_URLS.REPORT_FORM_URL,
                '_blank',
                'noopener,noreferrer',
              )
            }
            className="rounded-full border border-neutral-300 bg-neutral-200 px-9 py-2 text-[1.25vw] font-medium text-black transition-all duration-100 hover:bg-brand-main"
          >
            접수하기
          </button>
        </div>
        <img src={section501} alt="section501" className="w-[30%]" />
      </div>
      <div className="flex flex-col items-start justify-center gap-4">
        <p className="text-[1.25vw] font-medium">디베이트 타이머</p>
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              window.open(
                LANDING_URLS.PRIVACY_POLICY_URL,
                '_blank',
                'noopener,noreferrer',
              )
            }
            className="text-[1vw] text-neutral-500 transition-colors hover:text-neutral-700"
          >
            개인정보처리방침
          </button>
          <span className="text-[1vw] text-neutral-500">|</span>
          <button
            onClick={() =>
              window.open(
                LANDING_URLS.TERMS_OF_SERVICE_URL,
                '_blank',
                'noopener,noreferrer',
              )
            }
            className="text-[1vw] text-neutral-500 transition-colors hover:text-neutral-700"
          >
            서비스 이용약관
          </button>
        </div>
      </div>
    </section>
  );
}
