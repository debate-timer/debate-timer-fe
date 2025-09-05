import { useNavigate, useParams } from 'react-router-dom';

import clapImage from '../../assets/datateEnd/clap.png';
import feedbackTimerImage from '../../assets/datateEnd/feedback_timer.png';
import voteStampImage from '../../assets/datateEnd/vote_stamp.png';
import GoToHomeButton from '../../components/GoToHomeButton/GoToHomeButton';

export default function DebateEndPage() {
  const { id: tableId } = useParams();
  const navigate = useNavigate();

  const handleFeedbackClick = () => {
    navigate(`/debateEnd/${tableId}/feedback`);
  };

  const backgroundStyle = {
    background:
      'radial-gradient(50% 50% at 50% 50%, #fecd4c21 0%, #ffffff42 100%)',
  };

  return (
    <div
      style={backgroundStyle}
      className="flex min-h-screen flex-col items-center justify-center font-pretendard"
    >
      <div className="mb-36 flex items-center gap-4">
        <h1 className="text-display-raw font-semibold text-default-black">
          토론을 모두 마치셨습니다
        </h1>
        <img src={clapImage} alt="박수" className="h-20 w-20" />
      </div>

      <div className="flex gap-20">
        {/* 피드백 타이머 카드 */}
        {/* 원래는 gap 30px이 맞지만 승패투표 카드 내부 정렬이랑 비슷하게 가져가기 위해 여기 간격을 더 띄운다. 승패투표 카드 구현 후 되돌리기 */}
        <button
          onClick={handleFeedbackClick}
          className="flex h-[370px] w-[370px] cursor-pointer flex-col items-center justify-center gap-11 rounded-[34px] border-2 border-default-disabled/hover bg-white"
        >
          <img
            src={feedbackTimerImage}
            alt="피드백 타이머"
            className="h-[108px] w-[108px]"
          />
          <h2 className="text-title-raw font-bold text-default-black">
            피드백 타이머
          </h2>
          <p className="text-detail-raw text-default-border">
            심사평 및 Q&A용 타이머 →
          </p>
        </button>

        {/* 승패투표 카드 */}
        <button
          onClick={handleFeedbackClick}
          className="flex h-[370px] w-[370px] cursor-pointer flex-col items-center justify-center gap-[30px] rounded-[34px] border-2 border-default-disabled/hover bg-[#e3e3e3] text-default-disabled/hover"
          disabled={true}
        >
          <img
            src={voteStampImage}
            alt="투표"
            className="h-[108px] w-[108px]"
          />
          <div>
            <p className="text-title-raw font-semibold text-default-black">
              현재 &apos;승패투표&apos;
            </p>
            <p className="text-title-raw font-semibold text-default-black">
              페이지는
              <span className="font-bold text-[#F64740]">&nbsp;준비 중</span>
              입니다.
            </p>
          </div>
          <p className="text-detail-raw text-default-border">
            빠른 시일 내로 만나 뵙겠습니다.
          </p>
        </button>
      </div>
      <div className="mt-[74px]">
        <GoToHomeButton />
      </div>
    </div>
  );
}
