import { useNavigate, useParams } from 'react-router-dom';

import clapImage from '../../assets/debateEnd/clap.png';
import feedbackTimerImage from '../../assets/debateEnd/feedback_timer.png';
import voteStampImage from '../../assets/debateEnd/vote_stamp.png';
import GoToHomeButton from '../../components/GoToHomeButton/GoToHomeButton';
import usePostPoll from '../../hooks/mutations/useCreatePoll';
import MenuCard from './components/MenuCard';

export default function DebateEndPage() {
  const { id: tableId } = useParams();
  const navigate = useNavigate();

  const handleFeedbackClick = () => {
    navigate(`/table/customize/${tableId}/end/feedback`);
  };

  const handleVoteClick = (pollId: number) => {
    navigate(`/table/customize/${pollId}/end/vote`);
  };
  const { mutate } = usePostPoll(handleVoteClick);
  const backgroundStyle = {
    background:
      'radial-gradient(50% 50% at 50% 50%, #fecd4c21 0%, #ffffff42 100%)',
  };

  return (
    <div
      style={backgroundStyle}
      className="flex min-h-screen flex-col items-center justify-center p-4 font-pretendard"
    >
      <div className="mb-12 flex items-center justify-center gap-4 text-center lg:mb-16 xl:mb-24">
        <h1 className="text-3xl font-semibold text-default-black md:text-4xl lg:text-5xl xl:text-display-raw">
          토론을 모두 마치셨습니다
        </h1>
        <img
          src={clapImage}
          alt="박수"
          className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 xl:h-20 xl:w-20"
        />
      </div>

      <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:gap-10 lg:gap-12 xl:gap-20">
        <MenuCard
          title="피드백 타이머"
          description="심사평 및 Q&A용 타이머 →"
          imgSrc={feedbackTimerImage}
          imgAlt="피드백 타이머"
          onClick={handleFeedbackClick}
          ariaLabel="피드백 타이머로 이동"
        />

        <MenuCard
          title="승패투표 진행하기"
          description="QR 코드를 통해 투표 페이지로 이동해요."
          imgSrc={voteStampImage}
          imgAlt="승패투표"
          onClick={() => {
            if (!tableId) return; // NaN 방지
            mutate(Number(tableId));
          }}
          ariaLabel="승패투표 생성 및 진행"
        />
      </div>
      <div className="mt-12 lg:mt-16 xl:mt-[74px]">
        <GoToHomeButton />
      </div>
    </div>
  );
}
