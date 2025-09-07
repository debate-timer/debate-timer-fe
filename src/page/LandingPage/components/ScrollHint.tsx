import { useEffect, useState } from 'react';
import arrowDown from '../../../assets/landing/bottom_arrow.png';
type ScrollHintProps = {
  topThreshold?: number; //최상단 판정 임계값 (px)
};

export default function ScrollHint({ topThreshold = 10 }: ScrollHintProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      const atTop = window.scrollY <= topThreshold;
      // 최상단이면 보이고, 아니면 숨김
      setVisible(atTop);
    };
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [topThreshold]);

  return (
    <div
      className={`
        pointer-events-none fixed inset-x-0 bottom-10 flex justify-center
        transition-all duration-300
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
      `}
      aria-hidden={!visible}
    >
      <div
        className={`
          pointer-events-auto flex items-center gap-2 rounded-full
          bg-default-white/90 px-4 py-2 text-[min(max(0.85rem,1.2vw),1rem)] font-medium shadow-[0_6px_18px_rgba(0,0,0,0.12)]
          ring-1
          ring-black/5 backdrop-blur
          transition-colors hover:bg-default-white
        `}
      >
        <img
          src={arrowDown}
          alt="아래로 스크롤"
          className="pointer-events-auto h-4 w-20 animate-bounce"
        />
      </div>
    </div>
  );
}
