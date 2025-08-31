import ReviewCard from './ReviewCard';
import { REVIEWS } from '../../../constants/reviews';

interface ReviewSectionProps {
  onStartWithoutLogin: () => void;
}

export default function ReviewSection({
  onStartWithoutLogin,
}: ReviewSectionProps) {
  return (
    <section
      id="section4"
      className="flex w-[95%] max-w-[1226px] flex-col gap-24 md:w-[64%]"
    >
      <div className="flex flex-col items-center justify-center gap-1 text-[min(max(1.4rem,3vw),2.8rem)] font-bold text-neutral-100">
        <h1>이미 많은 사람들이 디베이트 타이머로</h1>
        <h1>더 나은 토론환경을 만들고 있어요.</h1>
      </div>
      <div className="flex flex-row flex-wrap justify-between">
        {REVIEWS.map((review) => (
          <ReviewCard key={review.user} {...review} />
        ))}
      </div>
      <div className="flex w-full justify-center">
        <button
          className="rounded-full border border-neutral-300 bg-brand px-20 py-2 text-[min(max(0.875rem,1.25vw),1.2rem)] font-medium text-default-black transition-all duration-100 hover:bg-semantic-table hover:text-default-white"
          onClick={onStartWithoutLogin}
        >
          비회원으로 시작하기
        </button>
      </div>
    </section>
  );
}
