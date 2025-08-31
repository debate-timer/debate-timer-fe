import timer from '../../../assets/landing/timer.png';
import timerOperationTime from '../../../assets/landing/timer_operation_time.png';
import timerTimeBased from '../../../assets/landing/timer_timebased.png';
import keyInfo from '../../../assets/landing/key_info.png';
import timeoutButton from '../../../assets/landing/timeout_button.png';
export default function TimerSection() {
  return (
    <section
      id="section2"
      className="flex w-[95%] max-w-[1226px] flex-col gap-24 md:w-[64%]"
    >
      <div>
        <div className="relative inline-block text-[min(max(0.875rem,1.5vw),1.4rem)] font-semibold">
          <span className="relative z-10">타이머 화면</span>
          <span className="absolute bottom-0 left-0 z-0 h-4 w-full bg-brand/70"></span>
        </div>
        <h2 className="mt-4 text-left text-[min(max(1.25rem,2.75vw),2.5rem)] font-bold">
          원하는 때에 <br />
          작전시간 사용하기
        </h2>
      </div>
      <div className="flex flex-row items-center justify-center gap-8 px-4">
        <img src={timer} alt="section301" className="flex w-1/2" />
        <div className="flex w-1/2 flex-col items-center gap-4">
          <h3 className="text-[min(max(1.1rem,1.75vw),1.8rem)] font-semibold">
            토론자가 작전시간을
            <br />
            요청하면{' '}
            <img
              src={timeoutButton}
              alt="작전시간 사용"
              className="inline-block h-[1.8rem] align-middle"
              style={{ transform: 'translateY(-0.1em)' }}
            />{' '}
            <br />
            버튼을 눌러 시간을 사용해요
          </h3>
        </div>
      </div>
      <div className="flex flex-row items-center justify-center gap-8 px-4">
        <div className="flex w-1/2 flex-col items-center gap-4">
          <h3 className="text-[min(max(1.1rem,1.75vw),1.8rem)] font-semibold">
            작전시간이 나타나면
            <br /> 원하는 시간을 입력하세요!
          </h3>
        </div>
        <img src={timerOperationTime} alt="section302" className="flex w-1/2" />
      </div>

      <div>
        <h2 className="mt-4 text-left text-[min(max(1.25rem,2.75vw),2.5rem)] font-bold">
          키보드 방향키로 <br />더 편리한 조작
        </h2>
      </div>
      <div className="flex flex-row items-center justify-center gap-8 px-4">
        <img src={keyInfo} alt="section203" className="m-10 w-1/3" />
        <img src={timerTimeBased} alt="section203" className="w-1/2" />
      </div>
    </section>
  );
}
