import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import clapImage from '../../assets/debateEnd/clap.png';
import feedbackTimerImage from '../../assets/debateEnd/feedback_timer.png';
import voteStampImage from '../../assets/debateEnd/vote_stamp.png';
import usePostPoll from '../../hooks/mutations/useCreatePoll';
import MenuCard from './components/MenuCard';
import GoToOverviewButton from './components/GoToOverviewButton';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../util/languageRouting';

export default function DebateEndPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const tableId = Number(id);
  const navigate = useNavigate();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;

  const handleFeedbackClick = () => {
    navigate(buildLangPath(`/table/customize/${tableId}/end/feedback`, lang));
  };
  const handleVoteClick = (pollId: number) => {
    navigate(
      buildLangPath(`/table/customize/${tableId}/end/vote/${pollId}`, lang),
    );
  };
  const { mutate } = usePostPoll(handleVoteClick);

  const backgroundStyle = {
    background:
      'radial-gradient(50% 50% at 50% 50%, #fecd4c21 0%, #ffffff42 100%)',
  };

  // 테이블 ID 검증
  if (!id || isNaN(tableId)) {
    throw new Error(t('테이블 ID가 올바르지 않습니다.'));
  }

  return (
    <div
      style={backgroundStyle}
      className="relative flex h-screen w-full flex-col items-center justify-center p-4"
    >
      <div className="mb-12 flex items-center justify-center gap-4 text-center lg:mb-16 xl:mb-24">
        <h1 className="text-3xl font-semibold text-default-black md:text-4xl lg:text-5xl xl:text-display-raw">
          {t('토론을 모두 마치셨습니다')}
        </h1>
        <img
          src={clapImage}
          alt={t('박수')}
          className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 xl:h-20 xl:w-20"
        />
      </div>

      <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:gap-10 lg:gap-12 xl:gap-20">
        <MenuCard
          title={t('피드백 타이머')}
          description={t('심사평 및 Q&A용 타이머 →')}
          imgSrc={feedbackTimerImage}
          imgAlt={t('피드백 타이머')}
          onClick={handleFeedbackClick}
          ariaLabel={t('피드백 타이머로 이동')}
        />

        <MenuCard
          title={t('승패투표 진행하기')}
          description={t('QR 코드를 통해 투표 페이지로 이동해요.')}
          imgSrc={voteStampImage}
          imgAlt={t('승패투표')}
          onClick={() => mutate(tableId)}
          ariaLabel={t('승패투표 생성 및 진행')}
        />
      </div>

      <div className="fixed bottom-[8%] xl:bottom-[12%]">
        <GoToOverviewButton tableId={Number(tableId)} className="w-[478px]" />
      </div>
    </div>
  );
}
