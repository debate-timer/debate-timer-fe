import section201 from '../../../assets/landing/section2-1.png';
import section202 from '../../../assets/landing/section2-2.png';
import section203 from '../../../assets/landing/section2-3.png';

export default function TimerSection() {
  return (
    <section
      id="section2"
      className="flex w-[64%] max-w-[1226px] flex-col gap-24"
    >
      <div>
        <div className="relative inline-block text-[1.5vw] font-semibold">
          <span className="relative z-10">타이머 화면</span>
          <span className="absolute bottom-0 left-0 z-0 h-4 w-full bg-brand-main/70"></span>
        </div>
        <h1 className="mt-4 text-left text-[2.75vw] font-bold">
          키보드 방향키로 더 편리한 조작
        </h1>
      </div>
      <div className="flex flex-col gap-4">
        <img src={section201} alt="section201" className="w-full" />
        <p className="text-right text-[1vw] text-neutral-600">일반 타이머</p>
      </div>

      <div className="flex flex-col items-center gap-1 font-medium text-neutral-600">
        <p className="text-center text-[1.5vw]">
          토론자들이 손을 들고 작전시간을 요청하면
        </p>
        <p className="text-center text-[1.5vw]">
          버튼을 통해 작전시간을 세팅할 수 있어요.
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-4">
        <img src={section202} alt="section202" className="w-full" />
        <p className="text-right text-[1vw] text-neutral-600">
          자유토론형 타이머
        </p>
      </div>
      <div className="flex flex-col items-center gap-6">
        <p className="text-center text-[1.5vw] font-medium text-neutral-600">
          키보드로 타이머를 보다 편하게 조작해보세요!
        </p>
        <img src={section203} alt="section203" className="w-1/3" />
      </div>
    </section>
  );
}
