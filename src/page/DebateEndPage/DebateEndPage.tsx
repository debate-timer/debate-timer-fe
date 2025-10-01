import { useNavigate, useParams } from 'react-router-dom';

import clapImage from '../../assets/debateEnd/clap.png';
import feedbackTimerImage from '../../assets/debateEnd/feedback_timer.png';
import voteStampImage from '../../assets/debateEnd/vote_stamp.png';
import GoToHomeButton from '../../components/GoToHomeButton/GoToHomeButton';

export default function DebateEndPage() {
  const { id: tableId } = useParams();
  const navigate = useNavigate();

  const handleFeedbackClick = () => {
    navigate(`/table/customize/${tableId}/end/feedback`);
  };

  const backgroundStyle = {
    background:
      'radial-gradient(50% 50% at 50% 50%, #fecd4c21 0%, #ffffff42 100%)',
  };

  return (
    <div
      style={backgroundStyle}
      className="relative flex h-screen w-full flex-col items-center justify-center p-4"
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
        {/* 피드백 타이머 카드 */}
        <button
          onClick={handleFeedbackClick}
          className="flex h-[280px] w-[280px] flex-col items-center justify-center gap-6 rounded-[34px] border-2 border-default-disabled/hover bg-white transition-all duration-300 hover:border-brand/40 hover:shadow-[0px_0px_22px_6px_#FECD4C63] md:h-[300px] md:w-[300px] lg:h-[340px] lg:w-[340px] xl:h-[370px] xl:w-[370px] xl:gap-11"
        >
          <img
            src={feedbackTimerImage}
            alt="피드백 타이머"
            className="h-20 w-20 md:h-24 md:w-24 lg:h-[96px] lg:w-[96px] xl:h-[108px] xl:w-[108px]"
          />
          <h2 className="text-lg font-bold text-default-black md:text-xl lg:text-2xl xl:text-title-raw">
            피드백 타이머
          </h2>
          <p className="text-sm text-default-border md:text-base lg:text-lg xl:text-detail-raw">
            심사평 및 Q&A용 타이머 →
          </p>
        </button>

        {/* 승패투표 카드 */}
        <button
          onClick={handleFeedbackClick}
          className="flex h-[280px] w-[280px] flex-col items-center justify-center gap-6 rounded-[34px] border-2 border-default-disabled/hover bg-[#e3e3e3] text-default-disabled/hover transition-all duration-300 md:h-[300px] md:w-[300px] lg:h-[340px] lg:w-[340px] xl:h-[370px] xl:w-[370px] xl:gap-[30px]"
          disabled={true}
        >
          <img
            src={voteStampImage}
            alt="투표"
            className="h-20 w-20 md:h-24 md:w-24 lg:h-[96px] lg:w-[96px] xl:h-[108px] xl:w-[108px]"
          />
          <div className="text-center">
            <p className="text-lg font-semibold text-default-black md:text-xl lg:text-2xl xl:text-title-raw">
              현재 &apos;승패투표&apos;
            </p>
            <p className="text-lg font-semibold text-default-black md:text-xl lg:text-2xl xl:text-title-raw">
              페이지는
              <span className="font-bold text-[#F64740]">&nbsp;준비 중</span>
              입니다.
            </p>
          </div>
          <p className="text-sm text-default-border md:text-base lg:text-lg xl:text-detail-raw">
            빠른 시일 내로 만나 뵙겠습니다.
          </p>
        </button>
      </div>

      <div className="fixed bottom-[8%] xl:bottom-[12%]">
        <GoToHomeButton />
      </div>
    </div>
  );
}
