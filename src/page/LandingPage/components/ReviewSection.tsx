import ReviewCard from './ReviewCard';

interface ReviewSectionProps {
  onStartWithoutLogin: () => void;
}

export default function ReviewSection({
  onStartWithoutLogin,
}: ReviewSectionProps) {
  return (
    <section id="section4" className="flex flex-col items-center gap-24">
      <div className="flex flex-col items-center justify-center gap-1 text-[3vw] font-bold">
        <h1>이미 많은 사람들이 디베이트 타이머로</h1>
        <h1>더 나은 토론환경을 만들고 있어요.</h1>
      </div>
      <div className="flex flex-row flex-wrap justify-between">
        <ReviewCard
          quote="깔끔한 완성도 뒤에 숨은 노고에 감사드립니다!"
          content={
            <>
              디베이트 타이머를 사용하면서 가장 인상 깊었던 점은 ‘깔끔함’
              이었습니다! 섬세한 아이디어와 세심한 구성들이 곳곳에 담겨 있었고,
              그 덕분에 사용자로서도 정말 쾌적하게 이용할 수 있었어요!! 😆{' '}
              <br /> 앞으로도 동아리에서 계속 쓰려구요 넘 감사드립니다☺️💕
            </>
          }
          user="솔빈"
        />
        <ReviewCard
          quote="편리함과 구조 모두 만족스러웠습니다."
          content={
            <>
              편리성 면에서 디베이트 타이머는 기존의 다른 타이머들보다 확실히
              뛰어났습니다. 필요한 기능들이 직관적으로 배치되어 있어서 처음
              사용하는 사람도 쉽게 적응할 수 있었고, 무엇보다 구조가 잘 잡혀
              있어서, 전체적인 토론 흐름이 끊기지 않게 자연스러웠던 점이 특히
              인상 깊었습니다.
            </>
          }
          user="하루"
        />
        <ReviewCard
          quote="토론이 하고 싶어지는 타이머였습니다."
          content={
            <>
              단순히 시간을 재는 도구를 넘어, 실제 토론 경험이 깊이 녹아든
              서비스라는 인상을 받았습니다. 토론을 자주 하시는 분들이라면 정말
              유용하게 활용하실 수 있을 것 같고, 저처럼 토론 경험이 많지 않은
              사람에게도 ‘나도 한번 해보고 싶다’는 생각이 들게 만드는
              타이머였습니다. 진심으로 응원합니다! 파이팅! ❤️
            </>
          }
          user="진우"
        />
      </div>
      <button
        className="rounded-full bg-brand-main px-20 py-2 text-[1.25vw] font-medium text-black shadow-md transition-all duration-100 hover:bg-brand-sub1 hover:text-neutral-0"
        onClick={onStartWithoutLogin}
      >
        비회원으로 시작하기
      </button>
    </section>
  );
}
