import timeboxStep from '../../../assets/landing/timebox_step.png';
import timeboxButtons from '../../../assets/landing/timebox_step_button.png';
import bellSetting from '../../../assets/landing/bell_setting.png';
import twoTimer from '../../../assets/landing/two_timer.png';
import timeboxAddButton from '../../../assets/landing/timebox_add_button.png';
export default function TimeTableSection() {
  return (
    <section id="section1" className="flex flex-col gap-24">
      <div>
        <div className="relative inline-block text-[min(max(0.875rem,1.5vw),1.4rem)] font-semibold">
          <span className="relative z-10">시간표 설정화면</span>
          <span className="absolute bottom-0 left-0 z-0 h-4 w-full bg-brand/70"></span>
        </div>
        <h2 className="mt-4 text-left text-[min(max(1.25rem,2.75vw),2.5rem)] font-bold">
          간편한 시간표 구성
        </h2>
      </div>
      <div className="flex flex-row items-center justify-center gap-8 px-4">
        <img src={timeboxStep} alt="section301" className="flex w-1/2" />
        <img src={timeboxButtons} alt="section301" className="flex w-1/3" />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <h2 className="text-left text-[min(max(1.25rem,2.75vw),2.5rem)] font-bold">
          시간표 추가
        </h2>
        <img
          src={timeboxAddButton}
          alt="시간표 추가 버튼"
          className="h-[min(max(1.7rem,3vw),2.7rem)] w-auto"
        />
      </div>
      <div className="flex flex-row items-center justify-center gap-8 px-4">
        <img src={twoTimer} alt="section302" className="flex w-1/2" />
        <div className="flex w-1/2 flex-col items-center gap-4">
          <h3 className="text-[min(max(1.1rem,1.75vw),1.8rem)] font-semibold">
            두가지 타이머
          </h3>
          <p className="text-[min(max(0.875rem,1.5vw),1.4rem)] font-medium text-neutral-600">
            일반형과 자유토론형 타이머로,
            <br />
            다양한 토론 방식을 지원해요.
          </p>
        </div>
      </div>
      <div className="flex flex-row items-center justify-center gap-8 px-4">
        <div className="flex w-1/2 flex-col items-center gap-4">
          <h3 className="text-[min(max(1.1rem,1.75vw),1.8rem)] font-semibold">
            종소리 설정
          </h3>
          <p className="text-[min(max(0.875rem,1.5vw),1.4rem)] font-medium text-neutral-600">
            시간에 따른 종소리를 내마음대로
            <br />
            커스터마이징 할 수 있어요.
          </p>
        </div>
        <img src={bellSetting} alt="section302" className="flex w-1/2" />
      </div>
    </section>
  );
}
