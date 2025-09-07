import section301 from '../../../assets/landing/debate_info_setting.png';
import section302 from '../../../assets/landing/table_list.png';

interface TableSectionProps {
  onLogin: () => void;
}

export default function TableSection({ onLogin }: TableSectionProps) {
  return (
    <section id="section3" className="flex flex-col gap-24">
      <div>
        <div className="relative inline-block text-[min(max(0.875rem,1.5vw),1.4rem)] font-semibold">
          <span className="relative z-10">홈 | 설정</span>
          <span className="absolute bottom-0 left-0 z-0 h-4 w-full bg-brand/70"></span>
        </div>
        <h2 className="mt-4 text-left text-[min(max(1.25rem,2.75vw),2.5rem)] font-bold">
          토론 정보 <br />
          관리 및 기록
        </h2>
      </div>
      <div className="flex flex-row items-center justify-center gap-8 px-4">
        <div className="flex w-1/2 flex-col items-center gap-4">
          <h3 className="text-[min(max(1.1rem,1.75vw),1.8rem)] font-semibold">
            토론 기본 정보 설정
          </h3>
          <p className="text-[min(max(0.875rem,1.5vw),1.4rem)] font-medium text-neutral-600">
            시간표 이름부터 주제까지!
          </p>
        </div>
        <img src={section301} alt="section301" className="flex w-1/2" />
      </div>
      <div className="flex flex-row items-center justify-center gap-8 px-4">
        <img src={section302} alt="section302" className="flex w-1/2" />
        <div className="flex w-1/2 flex-col items-center gap-4">
          <h3 className="text-[min(max(1.1rem,1.75vw),1.8rem)] font-semibold">
            시간표 목록
          </h3>
          <p className="text-[min(max(0.875rem,1.5vw),1.4rem)] font-medium text-neutral-600">
            내가 만든 시간표를 저장하고 싶나요?
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-1 text-[min(max(1.25rem,2.75vw),2.5rem)] font-bold">
        <p>시간표를 저장하려면,</p>
        <p>디베이트 타이머에 로그인해 보세요!</p>
        <button
          className="mt-14 rounded-full border border-neutral-300 bg-brand px-5 py-2 text-[min(max(0.875rem,1.25vw),1.2rem)] font-medium text-default-black transition-all duration-100 hover:bg-semantic-table hover:text-default-white"
          onClick={onLogin}
        >
          3초 로그인 하기
        </button>
      </div>
    </section>
  );
}
