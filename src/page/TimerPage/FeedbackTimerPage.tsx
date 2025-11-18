import { useEffect } from 'react';
import { useFeedbackTimer } from './hooks/useFeedbackTimer';
import FeedbackTimer from './components/FeedbackTimer';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import GoToDebateEndButton from '../../components/GoToDebateEndButton/GoToDebateEndButton';
import { useParams } from 'react-router-dom';

const INITIAL_TIME = 0;

export default function FeedbackTimerPage() {
  const feedbackTimerInstance = useFeedbackTimer();
  const { id } = useParams();
  const rawTableId = Number(id);
  const { setTimer, setDefaultTimer } = feedbackTimerInstance;

  // 테이블 ID 검증 로직
  if (rawTableId === null || isNaN(Number(rawTableId))) {
    throw new Error('테이블 ID가 올바르지 않습니다.');
  }
  const tableId = rawTableId ? Number(rawTableId) : 0;

  useEffect(() => {
    // 페이지가 로드될 때 타이머의 초기 시간을 설정
    setTimer(INITIAL_TIME);
    setDefaultTimer(INITIAL_TIME);
  }, [setTimer, setDefaultTimer]);

  return (
    <DefaultLayout>
      <DefaultLayout.ContentContainer>
        <div className="relative flex h-screen w-full flex-col items-center justify-center space-y-[54px] pb-[66px] xl:space-y-[60px]">
          <FeedbackTimer feedbackTimerInstance={feedbackTimerInstance} />

          <div className="fixed bottom-[8%] xl:bottom-[12%]">
            <GoToDebateEndButton tableId={tableId} />
          </div>
        </div>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
