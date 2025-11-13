import { useFeedbackTimer } from './hooks/useFeedbackTimer';
import FeedbackTimer from './components/FeedbackTimer';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import GoToHomeButton from '../../components/GoToHomeButton/GoToHomeButton';

export default function FeedbackTimerPage() {
  const feedbackTimerInstance = useFeedbackTimer();

  return (
    <DefaultLayout>
      <DefaultLayout.ContentContainer>
        <div className="relative flex h-screen w-full flex-col items-center justify-center space-y-[54px] pb-[66px] xl:space-y-[60px]">
          <FeedbackTimer feedbackTimerInstance={feedbackTimerInstance} />

          <div className="fixed bottom-[8%] xl:bottom-[12%]">
            <GoToHomeButton />
          </div>
        </div>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
