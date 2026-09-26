import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdErrorOutline } from 'react-icons/md';
import { useAudienceShareState } from './hooks/useAudienceShareState';
import { useAudienceCountdown } from './hooks/useAudienceCountdown';
import { useAudienceTimeBasedCountdown } from './hooks/useAudienceTimeBasedCountdown';
import AudienceNormalTimer from './components/AudienceNormalTimer';
import AudienceTimeBasedTimer from './components/AudienceTimeBasedTimer';
import ChairmanStatusNotice from './components/ChairmanStatusNotice';
import ConnectionLostNotice from './components/ConnectionLostNotice';
import DebateWaitingNotice from './components/DebateWaitingNotice';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import HeaderTableInfo from '../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../components/HeaderTitle/HeaderTitle';
import { useGetDebateTableDataForShare } from '../../hooks/query/useGetDebateTableDataForShare';
import { resolveAudienceScreenState } from './hooks/AudienceScreenState';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../util/languageRouting';

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
      <p className="whitespace-pre-line break-keep px-4 text-center text-xl font-semibold text-gray-800 xl:text-2xl">
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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;

  const tableId = Number(id);
  const isValidTableId =
    !!id && !isNaN(tableId) && tableId > 0 && Number.isInteger(tableId);
  const debateTableQuery = useGetDebateTableDataForShare(
    isValidTableId ? tableId : undefined,
  );
  // 테이블 정보를 한 번이라도 받았으면 소켓을 유지한다.
  // 재조회에 실패했다고 소켓까지 내리면, 서버가 내려갔을 때 재연결과 연결 끊김 안내가 사라진다.
  const state = useAudienceShareState(tableId, {
    enabled: isValidTableId && !!debateTableQuery.data,
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

  // 서버와의 연결이 끊겨 스스로 복구할 수 없는 상태 (새로고침이 필요)
  const isConnectionLost = state.connectionStatus === 'lost';

  // 사회자 연결이 끊기거나 서버 연결이 끊기면 마지막으로 보던 시간에서 카운트다운을 멈춘다
  const isChairmanAbsent =
    state.chairmanPresence === 'absent' || isConnectionLost;

  // 네트워크 지연 보정 기준 시각
  const syncedAt = state.status === 'displaying' ? state.syncedAt : null;

  const normalCountdown = useAudienceCountdown({
    receivedTime:
      viewState.type === 'NORMAL_TIMER'
        ? viewState.displayData.singleTime
        : null,
    isRunning:
      viewState.type === 'NORMAL_TIMER'
        ? viewState.displayData.isRunning && !isChairmanAbsent
        : false,
    // 끊김으로 멈출 때는 마지막 수신 시간으로 되돌리지 않고 현재 값을 유지
    shouldResetOnRunStateChange: !isChairmanAbsent,
    syncedAt,
  });
  const timeBasedCountdown = useAudienceTimeBasedCountdown({
    displayData:
      viewState.type === 'TIME_BASED_TIMER'
        ? isChairmanAbsent
          ? { ...viewState.displayData, isRunning: false }
          : viewState.displayData
        : null,
    timePerTeam:
      viewState.type === 'TIME_BASED_TIMER'
        ? viewState.timeBox.timePerTeam
        : null,
    timePerSpeaking:
      viewState.type === 'TIME_BASED_TIMER'
        ? viewState.timeBox.timePerSpeaking
        : null,
    syncedAt,
  });

  // 토론이 종료되면 종료 안내 페이지로 이동 (뒤로 가기로 돌아오지 않도록 replace)
  const isFinished = viewState.type === 'FINISHED';
  useEffect(() => {
    if (!isFinished) {
      return;
    }

    navigate(buildLangPath(`/live/${tableId}/end`, lang), { replace: true });
  }, [isFinished, lang, navigate, tableId]);

  if (!isValidTableId) {
    throw new Error(t('유효하지 않은 토론방 ID입니다.'));
  }

  const handleReload = () => {
    window.location.reload();
  };

  const renderContent = () => {
    switch (viewState.type) {
      case 'LOADING':
        return <LoadingContent />;

      case 'WAITING':
        return <DebateWaitingNotice message={viewState.message} />;

      case 'NORMAL_TIMER':
        return (
          <div className="flex h-full w-full items-center justify-center [align-items:safe_center]">
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
          <div className="flex h-full w-full items-center justify-center [align-items:safe_center] md:px-4 xl:px-12">
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
        return <LoadingContent />;

      case 'ERROR':
      case 'CONFIG_ERROR':
        return (
          <ErrorContent message={viewState.message} onReload={handleReload} />
        );
    }
  };

  const isTimerVisible =
    viewState.type === 'NORMAL_TIMER' || viewState.type === 'TIME_BASED_TIMER';
  const shouldShowWaitingNotice =
    isTimerVisible && state.chairmanPresence === 'waiting' && !isConnectionLost;
  const shouldShowConnectionLostNotice = isTimerVisible && isConnectionLost;
  const shouldShowAbsentNotice =
    isTimerVisible && isChairmanAbsent && !isConnectionLost;

  const isHeaderVisible =
    viewState.type === 'WAITING' ||
    viewState.type === 'NORMAL_TIMER' ||
    viewState.type === 'TIME_BASED_TIMER';

  const tableInfo = debateTableQuery.data?.info;
  const tableNameLabel =
    !tableInfo?.name || tableInfo.name.trim() === ''
      ? t('테이블 이름 없음')
      : t(tableInfo.name);
  const agendaLabel =
    !tableInfo?.agenda || tableInfo.agenda.trim() === ''
      ? t('주제 없음')
      : t(tableInfo.agenda);
  const shouldShowHeader = isHeaderVisible && !!tableInfo;

  return (
    <DefaultLayout>
      {shouldShowHeader ? (
        <DefaultLayout.Header>
          <DefaultLayout.Header.Left>
            <HeaderTableInfo name={tableNameLabel} />
          </DefaultLayout.Header.Left>
          {/* 세로 모드 모바일에서는 헤더 공간이 좁아 주제를 본문 상단에 표시 */}
          <DefaultLayout.Header.Center className="hidden md:flex short:flex">
            <HeaderTitle title={agendaLabel} />
          </DefaultLayout.Header.Center>
          <DefaultLayout.Header.Right />
        </DefaultLayout.Header>
      ) : null}
      <DefaultLayout.ContentContainer>
        <div className="relative flex h-full w-full flex-col">
          {shouldShowHeader ? (
            <p
              data-testid="mobile-agenda"
              className="line-clamp-2 flex-shrink-0 break-keep pb-2 text-center text-lg font-semibold text-default-black md:hidden short:hidden"
            >
              {agendaLabel}
            </p>
          ) : null}
          {shouldShowWaitingNotice ? (
            <div className="flex-shrink-0 pb-2">
              <ChairmanStatusNotice variant="waiting" />
            </div>
          ) : null}
          <div className="relative min-h-0 w-full flex-1">
            {renderContent()}
            {shouldShowAbsentNotice ? (
              <ChairmanStatusNotice variant="absent" />
            ) : null}
            {shouldShowConnectionLostNotice ? (
              <ConnectionLostNotice onReload={handleReload} />
            ) : null}
          </div>
        </div>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
