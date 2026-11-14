import { useGetDebateTableData } from '../../hooks/query/useGetDebateTableData';
import TimerHeader from '../../layout/components/header/TimerHeader';
import TimerHeaderTools from '../../layout/components/header/TimerHeaderTools';
import { useTranslation } from 'react-i18next';
import { useFeedbackTimer } from './hooks/useFeedbackTimer';
import FeedbackTimer from './components/FeedbackTimer';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import GoToDebateEndButton from '../../components/GoToDebateEndButton/GoToDebateEndButton';
import { useParams } from 'react-router-dom';

export default function FeedbackTimerPage() {
  const { t } = useTranslation();
  const feedbackTimerInstance = useFeedbackTimer();
  const { id } = useParams();
  const tableId = Number(id);
  const { data } = useGetDebateTableData(
    tableId,
    Number.isSafeInteger(tableId) && tableId > 0,
  );

  // 테이블 ID 검증 로직
  if (!id || !Number.isSafeInteger(tableId) || tableId <= 0) {
    throw new Error(t('테이블 ID가 올바르지 않습니다.'));
  }

  return (
    <DefaultLayout
      header={
        <TimerHeader
          name={data?.info.name}
          agenda={data?.info.agenda}
          actions={<TimerHeaderTools />}
        />
      }
    >
      <DefaultLayout.ContentContainer>
        <div className="relative flex min-h-full w-full flex-col items-center justify-center space-y-[54px] pb-[66px] xl:space-y-[60px]">
          <FeedbackTimer feedbackTimerInstance={feedbackTimerInstance} />

          <div className="fixed bottom-[8%] xl:bottom-[12%]">
            <GoToDebateEndButton tableId={tableId} className="w-[478px]" />
          </div>
        </div>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
