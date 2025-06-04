import ReviewCard from './ReviewCard';
import { REVIEWS } from '../../../constants/reviews';

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
        {REVIEWS.map((review) => (
          <ReviewCard key={review.user} {...review} />
        ))}
      </div>
      <button
        className="rounded-full border border-neutral-300 bg-brand-main px-20 py-2 text-[1.25vw] font-medium text-black transition-all duration-100 hover:bg-brand-sub1 hover:text-neutral-0"
        onClick={onStartWithoutLogin}
      >
        비회원으로 시작하기
      </button>
    </section>
  );
}
