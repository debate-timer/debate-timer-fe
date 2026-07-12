import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdErrorOutline } from 'react-icons/md';
import { useAudienceShareState } from './hooks/useAudienceShareState';
import { useAudienceCountdown } from './hooks/useAudienceCountdown';
import AudienceNormalTimer from './components/AudienceNormalTimer';
import AudienceTimeBasedTimer from './components/AudienceTimeBasedTimer';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import HeaderTableInfo from '../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../components/HeaderTitle/HeaderTitle';
import { useGetDebateTableDataForShare } from '../../hooks/query/useGetDebateTableDataForShare';
import { DebateInfo, TimeBoxInfo } from '../../type/type';

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

type ValidNormalTimeBox = TimeBoxInfo & {
  boxType: 'NORMAL';
  time: number;
};

function isValidNormalTimeBox(
  timeBox: TimeBoxInfo | undefined,
): timeBox is ValidNormalTimeBox {
  return (
    timeBox?.boxType === 'NORMAL' && timeBox.time !== null && timeBox.time > 0
  );
}

function getNormalTimerTeamName(
  stance: TimeBoxInfo['stance'],
  info: DebateInfo,
) {
  if (stance === 'PROS') {
    return info.prosTeamName;
  }

  if (stance === 'CONS') {
    return info.consTeamName;
  }

  return '';
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

  if (!isValidTableId) {
    throw new Error(t('유효하지 않은 토론방 ID입니다.'));
  }

  const audienceDisplayData =
    state.status === 'displaying' ? state.displayData : null;
  const normalDisplayData =
    audienceDisplayData?.timerType === 'NORMAL' ? audienceDisplayData : null;
  const normalTimeBox = normalDisplayData
    ? debateTableQuery.data?.table[normalDisplayData.sequence]
    : undefined;
  const hasInvalidNormalTimeBox =
    normalDisplayData !== null && !isValidNormalTimeBox(normalTimeBox);

  const normalCountdown = useAudienceCountdown({
    receivedTime:
      audienceDisplayData?.timerType === 'NORMAL'
        ? audienceDisplayData.singleTime
        : null,
    isRunning:
      audienceDisplayData?.timerType === 'NORMAL'
        ? audienceDisplayData.isRunning
        : false,
  });
  const prosCountdown = useAudienceCountdown({
    receivedTime:
      audienceDisplayData?.timerType === 'TIME_BASED'
        ? audienceDisplayData.prosTime
        : null,
    isRunning:
      audienceDisplayData?.timerType === 'TIME_BASED' &&
      audienceDisplayData.isRunning &&
      audienceDisplayData.currentTeam === 'PROS',
  });
  const consCountdown = useAudienceCountdown({
    receivedTime:
      audienceDisplayData?.timerType === 'TIME_BASED'
        ? audienceDisplayData.consTime
        : null,
    isRunning:
      audienceDisplayData?.timerType === 'TIME_BASED' &&
      audienceDisplayData.isRunning &&
      audienceDisplayData.currentTeam === 'CONS',
  });

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
    if (state.error) {
      return (
        <ErrorContent
          message={t('서버 연결에 실패했어요.')}
          onReload={handleReload}
        />
      );
    }

    if (debateTableQuery.isError) {
      return (
        <ErrorContent
          message={t('필요한 데이터를 불러오지 못했어요. 다시 시도해보세요.')}
          onReload={handleReload}
        />
      );
    }

    if (hasInvalidNormalTimeBox) {
      return (
        <ErrorContent
          message={t('서버 연결에 실패했어요.')}
          onReload={handleReload}
        />
      );
    }

    if (
      debateTableQuery.isLoading ||
      !debateTableQuery.data ||
      state.status === 'connecting'
    ) {
      return <LoadingContent />;
    }

    if (state.status === 'waiting') {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center space-y-[20px]">
          <h1 className="text-center text-2xl font-bold text-gray-800 xl:text-4xl">
            {t('토론 시작을 대기 중입니다.')}
          </h1>
        </div>
      );
    }

    if (state.status === 'displaying') {
      const { displayData } = state;
      if (displayData.timerType === 'NORMAL') {
        if (!isValidNormalTimeBox(normalTimeBox)) {
          return null;
        }

        return (
          <div className="flex h-full w-full items-center justify-center">
            <AudienceNormalTimer
              remainingTime={
                normalCountdown.currentSeconds ?? displayData.singleTime
              }
              totalTime={normalTimeBox.time}
              speechType={normalTimeBox.speechType}
              stance={normalTimeBox.stance}
              teamName={getNormalTimerTeamName(
                normalTimeBox.stance,
                debateTableQuery.data.info,
              )}
              speaker={normalTimeBox.speaker}
              isRunning={displayData.isRunning}
            />
          </div>
        );
      }

      if (displayData.timerType === 'TIME_BASED') {
        return (
          <div className="flex h-full w-full items-center justify-center px-4 xl:px-12">
            <AudienceTimeBasedTimer
              prosRemainingTime={prosCountdown.currentSeconds}
              consRemainingTime={consCountdown.currentSeconds}
              currentTeam={displayData.currentTeam}
            />
          </div>
        );
      }
    }

    if (state.status === 'finished') {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center space-y-8">
          <h1 className="text-center text-3xl font-bold text-gray-800 xl:text-5xl">
            {t('토론이 종료되었습니다.')}
          </h1>
          <button
            type="button"
            className="rounded-lg bg-gray-800 px-6 py-3 text-lg font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            onClick={() => handleClosePage()}
          >
            {t('페이지 닫기')}
          </button>
        </div>
      );
    }

    return null;
  };

  const isReady =
    debateTableQuery.isSuccess &&
    !!debateTableQuery.data &&
    !state.error &&
    !hasInvalidNormalTimeBox &&
    state.status !== 'connecting';

  return (
    <DefaultLayout>
      {isReady ? (
        <DefaultLayout.Header>
          <DefaultLayout.Header.Left>
            <HeaderTableInfo
              name={
                debateTableQuery.data.info.name.trim() === ''
                  ? t('테이블 이름 없음')
                  : t(debateTableQuery.data.info.name)
              }
            />
          </DefaultLayout.Header.Left>
          <DefaultLayout.Header.Center>
            <HeaderTitle
              title={
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
