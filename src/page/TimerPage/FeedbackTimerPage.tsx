import { useEffect } from 'react';
import { useFeedbackTimer } from './hooks/useFeedbackTimer';
import FeedbackTimer from './components/FeedbackTimer';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import GoToHomeButton from '../../components/GoToHomeButton/GoToHomeButton';

const INITIAL_TIME = 0;

export default function FeedbackTimerPage() {
  const feedbackTimerInstance = useFeedbackTimer();
  const { setTimer, setDefaultTimer } = feedbackTimerInstance;

  useEffect(() => {
    // 페이지가 로드될 때 타이머의 초기 시간을 설정
    setTimer(INITIAL_TIME);
    setDefaultTimer(INITIAL_TIME);
  }, [setTimer, setDefaultTimer]);

  return (
    <DefaultLayout>
      <DefaultLayout.ContentContainer>
        <div className="relative flex h-full w-full flex-col items-center justify-center space-y-[54px] pb-[66px] xl:space-y-[60px]">
          <FeedbackTimer feedbackTimerInstance={feedbackTimerInstance} />
          <GoToHomeButton />
        </div>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
