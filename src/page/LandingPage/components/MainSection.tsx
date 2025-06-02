// src/components/landing/MainSection/MainSection.tsx
import preview from '../../../../public/landing/preview.webm';

interface MainSectionProps {
  onStartWithoutLogin: () => void;
}

export default function MainSection({ onStartWithoutLogin }: MainSectionProps) {
  return (
    <section
      id="main-section"
      className="flex flex-col items-center justify-center gap-12"
    >
      <video src={preview} autoPlay muted loop className="w-2/3" />
      <h1 className="text-[3.5vw] font-bold">토론 진행을 더 쉽고 빠르게</h1>
      <button
        onClick={onStartWithoutLogin}
        className="rounded-full bg-brand-main px-5 py-2 text-[1.25vw] font-medium text-black shadow-md transition-all duration-100 hover:bg-brand-sub1 hover:text-neutral-0"
      >
        비회원으로 시작하기
      </button>
    </section>
  );
}
