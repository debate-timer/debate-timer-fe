import { useFeedbackTimer } from './hooks/useFeedbackTimer';
import FeedbackTimer from './components/FeedbackTimer';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import GoToDebateEndButton from '../../components/GoToDebateEndButton/GoToDebateEndButton';
import { useParams } from 'react-router-dom';

export default function FeedbackTimerPage() {
  const feedbackTimerInstance = useFeedbackTimer();
  const { id } = useParams();
  const tableId = Number(id);

  // 테이블 ID 검증 로직
  if (!id || isNaN(tableId)) {
    throw new Error('테이블 ID가 올바르지 않습니다.');
  }

  return (
    <DefaultLayout>
      <DefaultLayout.ContentContainer>
        <div className="relative flex h-screen w-full flex-col items-center justify-center space-y-[54px] pb-[66px] xl:space-y-[60px]">
          <FeedbackTimer feedbackTimerInstance={feedbackTimerInstance} />

          <div className="fixed bottom-[8%] xl:bottom-[12%]">
            <GoToDebateEndButton tableId={tableId} className="w-[478px]" />
          </div>
        </div>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
