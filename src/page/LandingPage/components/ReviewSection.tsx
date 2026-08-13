import { useTranslation } from 'react-i18next';
import ReviewCard from './ReviewCard';
import { REVIEWS } from '../../../constants/reviews';
import FillButton from '../../../components/FillButton/FillButton';

interface ReviewSectionProps {
  onStartWithoutLogin: () => void;
}

export default function ReviewSection({
  onStartWithoutLogin,
}: ReviewSectionProps) {
  const { t } = useTranslation();
  return (
    <section
      id="section4"
      className="flex w-[95%] max-w-[1226px] flex-col gap-24 md:w-[64%]"
    >
      <div className="flex flex-col items-center justify-center gap-1 text-[min(max(1.4rem,3vw),2.8rem)] font-bold text-neutral-100">
        <h1 className="whitespace-pre-line">
          {t(
            '이미 많은 사람들이 디베이트 타이머로\n더 나은 토론환경을 만들고 있어요.',
          )}
        </h1>
      </div>
      <div className="flex flex-row flex-wrap justify-between">
        {REVIEWS.map((review) => (
          <ReviewCard key={review.user} {...review} />
        ))}
      </div>
      <div className="flex w-full justify-center">
        <FillButton size="lg" onClick={onStartWithoutLogin}>
          {t('비회원으로 시작하기')}
        </FillButton>
      </div>
    </section>
  );
}
