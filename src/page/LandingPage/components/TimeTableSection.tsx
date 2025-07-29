import section101 from '../../../assets/landing/section1-1.png';
import section102 from '../../../assets/landing/section1-2.png';

export default function TimeTableSection() {
  return (
    <section id="section1" className="flex flex-col gap-24">
      <div>
        <div className="relative inline-block text-[min(max(0.875rem,1.5vw),1.4rem)] font-semibold">
          <span className="relative z-10">시간표 설정 화면</span>
          <span className="absolute bottom-0 left-0 z-0 h-4 w-full bg-brand/70"></span>
        </div>
        <h1 className="mt-4 text-left text-[min(max(1.25rem,2.75vw),2.5rem)] font-bold">
          드래그 앤 드롭으로
          <br /> 간편하게 시간표 구성
        </h1>
      </div>

      <img src={section101} alt="section101" className="w-full" />
      <img src={section102} alt="section102" className="mt-5 w-full" />
      <div className="flex flex-col items-center gap-1">
        <p className="mb-2 text-center text-[min(max(1.1rem,1.75vw),1.8rem)] font-semibold">
          두 가지 타이머
        </p>
        <p className="text-center text-[min(max(0.875rem,1.5vw),1.4rem)] font-medium text-neutral-600">
          일반형과 자유토론형 타이머로,
        </p>
        <p className="text-center text-[min(max(0.875rem,1.5vw),1.4rem)] font-medium text-neutral-600">
          다양한 토론 방식을 지원해요.
        </p>
      </div>
    </section>
  );
}
