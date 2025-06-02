import { useState, useEffect } from 'react';
import section101 from '../../../public/landing/section1-1.png';
import section102 from '../../../public/landing/section1-2.png';
import preview from '../../../public/landing/preview.webm';
import section201 from '../../../public/landing/section2-1.png';
import section202 from '../../../public/landing/section2-2.png';
import section203 from '../../../public/landing/section2-3.png';
import section301 from '../../../public/landing/section3-1.png';
import section302 from '../../../public/landing/section3-2.png';
import ReviewCard from './components/ReviewCard';
import section501 from '../../../public/landing/section5-1.png';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const AuthLogin = () => {
    if (
      !import.meta.env.VITE_GOOGLE_O_AUTH_CLIENT_ID ||
      !import.meta.env.VITE_GOOGLE_O_AUTH_REDIRECT_URI
    ) {
      throw new Error('OAuth 정보가 없습니다.');
    }

    const params = {
      client_id: import.meta.env.VITE_GOOGLE_O_AUTH_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_GOOGLE_O_AUTH_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid profile email',
    };
    const queryString = new URLSearchParams(params).toString();
    const googleOAuthUrl = `${import.meta.env.VITE_GOOGLE_O_AUTH_REQUEST_URL}?${queryString}`;

    window.location.href = googleOAuthUrl;
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-neutral-0">
      {/* 헤더 */}
      <header
        className={`fixed left-0 top-0 z-20 flex w-full items-center justify-center bg-white py-2 transition-shadow duration-200 ${isScrolled ? 'shadow-md' : ''}`}
      >
        <div className="flex w-[70%] items-center justify-between">
          <div className="flex items-center text-[2vw] font-semibold">
            Debate Timer
          </div>
          <button className="text-[1.25vw]" onClick={AuthLogin}>
            3초 로그인
          </button>
        </div>
      </header>

      <main className="flex w-full flex-col items-center">
        {/* 흰색 배경 */}
        <div className="flex w-[64%] max-w-[1226px] flex-col gap-96 pb-48 pt-20">
          {/* 메인 화면 */}
          <section
            id="main-section"
            className="flex flex-col items-center justify-center gap-12"
          >
            <video src={preview} autoPlay muted loop className="w-2/3" />
            <h1 className="text-[3.5vw] font-bold">
              토론 진행을 더 쉽고 빠르게
            </h1>
            <button className="rounded-full bg-brand-main px-5 py-2 text-[1.25vw] font-medium text-black shadow-md transition-all duration-100 hover:bg-brand-sub1 hover:text-neutral-0">
              비회원으로 시작하기
            </button>
          </section>

          {/* 시간표 설정화면 */}
          <section id="section1" className="flex flex-col gap-24">
            <div>
              <div className="relative inline-block text-[1.5vw] font-semibold">
                <span className="relative z-10">시간표 설정화면</span>
                <span className="absolute bottom-0 left-0 z-0 h-4 w-full bg-brand-main/70"></span>
              </div>
              <h1 className="mt-4 text-left text-[2.75vw] font-bold">
                드래그 앤 드롭으로
                <br /> 간편하게 시간표 구성
              </h1>
            </div>

            <img src={section101} alt="section101" className="w-full" />
            <img src={section102} alt="section102" className="mt-5 w-full" />
            <div className="flex flex-col items-center gap-1">
              <p className="mb-2 text-center text-[1.75vw] font-semibold">
                두가지 타이머
              </p>
              <p className="text-center text-[1.5vw] font-medium text-neutral-600">
                일반형과 자유토론형 타이머로,
              </p>
              <p className="text-center text-[1.5vw] font-medium text-neutral-600">
                다양한 토론 방식을 지원해요.
              </p>
            </div>
          </section>
        </div>

        {/* 회색 배경 */}
        <div className="flex w-full flex-col items-center bg-background-dark py-48">
          {/* 타이머 화면 */}
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
              <p className="text-right text-[1vw] text-neutral-600">
                일반 타이머
              </p>
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
        </div>

        {/* 흰색 배경 */}
        <div className="flex w-[64%] max-w-[1226px] flex-col gap-96 py-48">
          {/* 홈 설정 */}
          <section id="section3" className="flex flex-col gap-24">
            <div>
              <div className="relative inline-block text-[1.5vw] font-semibold">
                <span className="relative z-10">홈 | 설정</span>
                <span className="absolute bottom-0 left-0 z-0 h-4 w-full bg-brand-main/70"></span>
              </div>
              <h1 className="mt-4 text-left text-[2.75vw] font-bold">
                토론 정보 관리 및 기록
              </h1>
            </div>
            <div className="flex flex-row items-center justify-center gap-8 px-4">
              <img src={section301} alt="section301" className="flex w-1/2" />
              <div className="flex w-1/2 flex-col items-center gap-4">
                <h1 className="text-[1.75vw] font-semibold">종소리 설정</h1>
                <p className="text-[1.5vw] font-medium text-neutral-600">
                  원하는 종소리만 골라서 설정할 수 있어요.
                </p>
              </div>
            </div>
            <div className="flex flex-row items-center justify-center gap-8 px-4">
              <div className="flex w-1/2 flex-col items-center gap-4">
                <h1 className="text-[1.75vw] font-semibold">시간표 목록</h1>
                <p className="text-[1.5vw] font-medium text-neutral-600">
                  내가 만든 시간표를 저장하고 싶나요?
                </p>
              </div>
              <img src={section302} alt="section302" className="flex w-1/2" />
            </div>

            <div className="flex flex-col items-center justify-center gap-1 text-[2.75vw] font-bold">
              <h1>시간표를 저장하려면,</h1>
              <h1>디베이트 타이머에 로그인해보세요!</h1>
              <button className="mt-14 rounded-full bg-brand-main px-5 py-2 text-[1.25vw] font-medium text-black shadow-md transition-all duration-100 hover:bg-brand-sub1 hover:text-neutral-0">
                3초 로그인 하기
              </button>
            </div>
          </section>

          {/* 리뷰 */}
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
                    이었습니다! 섬세한 아이디어와 세심한 구성들이 곳곳에 담겨
                    있었고, 그 덕분에 사용자로서도 정말 쾌적하게 이용할 수
                    있었어요!! 😆 <br /> 앞으로도 동아리에서 계속 쓰려구요 넘
                    감사드립니다☺️💕
                  </>
                }
                user="솔빈"
              />
              <ReviewCard
                quote="편리함과 구조 모두 만족스러웠습니다."
                content={
                  <>
                    편리성 면에서 디베이트 타이머는 기존의 다른 타이머들보다
                    확실히 뛰어났습니다. 필요한 기능들이 직관적으로 배치되어
                    있어서 처음 사용하는 사람도 쉽게 적응할 수 있었고, 무엇보다
                    구조가 잘 잡혀 있어서, 전체적인 토론 흐름이 끊기지 않게
                    자연스러웠던 점이 특히 인상 깊었습니다.
                  </>
                }
                user="하루"
              />
              <ReviewCard
                quote="토론이 하고 싶어지는 타이머였습니다."
                content={
                  <>
                    단순히 시간을 재는 도구를 넘어, 실제 토론 경험이 깊이 녹아든
                    서비스라는 인상을 받았습니다. 토론을 자주 하시는 분들이라면
                    정말 유용하게 활용하실 수 있을 것 같고, 저처럼 토론 경험이
                    많지 않은 사람에게도 ‘나도 한번 해보고 싶다’는 생각이 들게
                    만드는 타이머였습니다. 진심으로 응원합니다! 파이팅! ❤️
                  </>
                }
                user="진우"
              />
            </div>
            <button className="rounded-full bg-brand-main px-20 py-2 text-[1.25vw] font-medium text-black shadow-md transition-all duration-100 hover:bg-brand-sub1 hover:text-neutral-0">
              비회원으로 시작하기
            </button>
          </section>

          {/* 버그 및 불편사항 제보 */}
          <section id="section5" className="flex flex-col gap-16">
            <div className="flex flex-row justify-between gap-1">
              <div className="flex flex-col items-start justify-center gap-4">
                <p className="text-[2vw] font-semibold">
                  버그 및 불편사항 제보
                </p>
                <p className="text-[1.25vw] text-neutral-400">
                  디베이트 타이머 사용 중 불편함을 느끼셨나요?
                </p>
                <button className="rounded-full bg-neutral-200 px-9 py-2 text-[1.25vw] font-medium text-black transition-all duration-100 hover:bg-brand-main">
                  접수하기
                </button>
              </div>
              <img src={section501} alt="section501" className="w-[30%]" />
            </div>
            <div className="flex flex-col items-start justify-center gap-4">
              <p className="text-[1.25vw] font-medium">디베이트 타이머</p>
              <div className="flex items-center gap-1">
                <button className="text-[1vw] text-neutral-500 transition-colors hover:text-neutral-700">
                  개인정보처리방침
                </button>
                <span className="text-[1vw] text-neutral-500">|</span>
                <button className="text-[1vw] text-neutral-500 transition-colors hover:text-neutral-700">
                  서비스 이용약관
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
