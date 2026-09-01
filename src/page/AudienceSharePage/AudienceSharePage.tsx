import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdErrorOutline } from 'react-icons/md';
import { useAudienceShareState } from './hooks/useAudienceShareState';
import { useAudienceCountdown } from './hooks/useAudienceCountdown';
import { useAudienceTimeBasedCountdown } from './hooks/useAudienceTimeBasedCountdown';
import AudienceNormalTimer from './components/AudienceNormalTimer';
import AudienceTimeBasedTimer from './components/AudienceTimeBasedTimer';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import HeaderTableInfo from '../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../components/HeaderTitle/HeaderTitle';
import { useGetDebateTableDataForShare } from '../../hooks/query/useGetDebateTableDataForShare';
import { resolveAudienceScreenState } from './hooks/AudienceScreenState';

interface ErrorContentProps {
  message: string;
  onReload: () => void;
}

function LoadingContent() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <LoadingSpinner size="h-12 w-12" color="text-gray-500" />
    </div>
  );
}

function ErrorContent({ message, onReload }: ErrorContentProps) {
  const { t } = useTranslation();

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-6 text-center"
      role="alert"
    >
      <MdErrorOutline
        className="h-20 w-20 text-red-500"
        data-testid="audience-share-error-icon"
        aria-hidden="true"
      />
      <p className="text-xl font-semibold text-gray-800 xl:text-2xl">
        {message}
      </p>
      <button
        type="button"
        className="rounded-lg bg-gray-800 px-6 py-3 text-lg font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        onClick={onReload}
      >
        {t('새로고침')}
      </button>
    </div>
  );
}

export default function AudienceSharePage() {
  const { id } = useParams();
  const { t } = useTranslation();

  const tableId = Number(id);
  const isValidTableId =
    !!id && !isNaN(tableId) && tableId > 0 && Number.isInteger(tableId);
  const debateTableQuery = useGetDebateTableDataForShare(
    isValidTableId ? tableId : undefined,
  );
  const state = useAudienceShareState(tableId, {
    enabled: isValidTableId && debateTableQuery.isSuccess,
    table: debateTableQuery.data?.table,
  });

  const viewState = resolveAudienceScreenState(
    state,
    {
      data: debateTableQuery.data,
      isLoading: debateTableQuery.isLoading,
      isError: debateTableQuery.isError,
    },
    t,
  );

  const normalCountdown = useAudienceCountdown({
    receivedTime:
      viewState.type === 'NORMAL_TIMER'
        ? viewState.displayData.singleTime
        : null,
    isRunning:
      viewState.type === 'NORMAL_TIMER'
        ? viewState.displayData.isRunning
        : false,
  });
  const timeBasedCountdown = useAudienceTimeBasedCountdown({
    displayData:
      viewState.type === 'TIME_BASED_TIMER' ? viewState.displayData : null,
    timePerTeam:
      viewState.type === 'TIME_BASED_TIMER'
        ? viewState.timeBox.timePerTeam
        : null,
    timePerSpeaking:
      viewState.type === 'TIME_BASED_TIMER'
        ? viewState.timeBox.timePerSpeaking
        : null,
  });

  if (!isValidTableId) {
    throw new Error(t('유효하지 않은 토론방 ID입니다.'));
  }

  const handleClosePage = () => {
    // 일단 페이지 닫기
    window.close();

    // 페이지를 못 닫을 경우 홈으로
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  const handleReload = () => {
    window.location.reload();
  };

  const renderContent = () => {
    switch (viewState.type) {
      case 'LOADING':
        return <LoadingContent />;

      case 'WAITING':
        return (
          <div className="flex h-full w-full flex-col items-center justify-center space-y-[20px]">
            <h1 className="text-center text-2xl font-bold text-gray-800 xl:text-4xl">
              {viewState.message}
            </h1>
          </div>
        );

      case 'NORMAL_TIMER':
        return (
          <div className="flex h-full w-full items-center justify-center">
            <AudienceNormalTimer
              remainingTime={
                normalCountdown.currentSeconds ??
                viewState.displayData.singleTime
              }
              totalTime={viewState.timeBox.time}
              speechType={viewState.timeBox.speechType}
              stance={viewState.timeBox.stance}
              teamName={viewState.teamName}
              speaker={viewState.timeBox.speaker}
              isRunning={viewState.displayData.isRunning}
            />
          </div>
        );

      case 'TIME_BASED_TIMER': {
        const prosTotalRemainingTime =
          timeBasedCountdown.pros.totalRemainingTime ??
          viewState.timeBox.timePerTeam;
        const consTotalRemainingTime =
          timeBasedCountdown.cons.totalRemainingTime ??
          viewState.timeBox.timePerTeam;
        const prosCurrentSpeakingRemainingTime =
          viewState.timeBox.timePerSpeaking === null
            ? null
            : (timeBasedCountdown.pros.currentSpeakingRemainingTime ??
              viewState.timeBox.timePerSpeaking);
        const consCurrentSpeakingRemainingTime =
          viewState.timeBox.timePerSpeaking === null
            ? null
            : (timeBasedCountdown.cons.currentSpeakingRemainingTime ??
              viewState.timeBox.timePerSpeaking);

        return (
          <div className="flex h-full w-full items-center justify-center px-4 xl:px-12">
            <AudienceTimeBasedTimer
              prosTeamName={viewState.prosTeamName}
              consTeamName={viewState.consTeamName}
              timePerTeam={viewState.timeBox.timePerTeam}
              timePerSpeaking={viewState.timeBox.timePerSpeaking}
              prosTotalRemainingTime={prosTotalRemainingTime}
              consTotalRemainingTime={consTotalRemainingTime}
              prosCurrentSpeakingRemainingTime={
                prosCurrentSpeakingRemainingTime
              }
              consCurrentSpeakingRemainingTime={
                consCurrentSpeakingRemainingTime
              }
              currentTeam={viewState.displayData.currentTeam}
              isRunning={
                viewState.displayData.currentTeam === 'PROS'
                  ? timeBasedCountdown.pros.isRunning
                  : timeBasedCountdown.cons.isRunning
              }
            />
          </div>
        );
      }

      case 'FINISHED':
        return (
          <div className="flex h-full w-full flex-col items-center justify-center space-y-8">
            <h1 className="text-center text-3xl font-bold text-gray-800 xl:text-5xl">
              {viewState.message}
            </h1>
            <button
              type="button"
              className="rounded-lg bg-gray-800 px-6 py-3 text-lg font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              onClick={handleClosePage}
            >
              {t('페이지 닫기')}
            </button>
          </div>
        );

      case 'ERROR':
      case 'CONFIG_ERROR':
        return (
          <ErrorContent message={viewState.message} onReload={handleReload} />
        );
    }
  };

  const isHeaderVisible =
    viewState.type === 'WAITING' ||
    viewState.type === 'NORMAL_TIMER' ||
    viewState.type === 'TIME_BASED_TIMER' ||
    viewState.type === 'FINISHED';

  return (
    <DefaultLayout>
      {isHeaderVisible && debateTableQuery.data ? (
        <DefaultLayout.Header>
          <DefaultLayout.Header.Left>
            <HeaderTableInfo
              name={
                !debateTableQuery.data.info.name ||
                debateTableQuery.data.info.name.trim() === ''
                  ? t('테이블 이름 없음')
                  : t(debateTableQuery.data.info.name)
              }
            />
          </DefaultLayout.Header.Left>
          <DefaultLayout.Header.Center>
            <HeaderTitle
              title={
                !debateTableQuery.data.info.agenda ||
                debateTableQuery.data.info.agenda.trim() === ''
                  ? t('주제 없음')
                  : t(debateTableQuery.data.info.agenda)
              }
            />
          </DefaultLayout.Header.Center>
          <DefaultLayout.Header.Right />
        </DefaultLayout.Header>
      ) : null}
      <DefaultLayout.ContentContainer>
        <div className="relative flex h-full w-full flex-col">
          {renderContent()}
        </div>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
