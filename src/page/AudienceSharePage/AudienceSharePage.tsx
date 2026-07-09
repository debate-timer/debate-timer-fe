import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAudienceShareState } from './hooks/useAudienceShareState';
import { useAudienceCountdown } from './hooks/useAudienceCountdown';
import { AudienceShareError, AudienceShareErrorCode } from './error';
import AudienceNormalTimer from './components/AudienceNormalTimer';
import AudienceTimeBasedTimer from './components/AudienceTimeBasedTimer';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import LoadingSpinner from '../../components/LoadingSpinner';

export class AudienceShareDisplayError extends Error {
  public readonly sourceError: AudienceShareError;

  constructor(message: string, sourceError: AudienceShareError) {
    super(message);
    this.name = 'AudienceShareDisplayError';
    this.sourceError = sourceError;
  }
}

export default function AudienceSharePage() {
  const { id } = useParams();
  const { t } = useTranslation();

  const tableId = Number(id);

  if (!id || isNaN(tableId) || tableId <= 0 || !Number.isInteger(tableId)) {
    throw new Error(t('유효하지 않은 토론방 ID입니다.'));
  }

  const state = useAudienceShareState(tableId);
  const audienceDisplayData =
    state.status === 'displaying' ? state.displayData : null;

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

  if (state.error) {
    const errorMessages: Record<AudienceShareErrorCode, string> = {
      SOCKET_URL_UNAVAILABLE: '실시간 연결 주소를 확인할 수 없어요.',
      SOCKET_SERVER_REJECTED: '토론방 연결이 거부되었어요.',
      SOCKET_STOMP_ERROR: '실시간 연결에서 서버 오류가 발생했어요.',
      SOCKET_RETRY_EXHAUSTED: '실시간 연결을 복구하지 못했어요.',
      EVENT_TIMEOUT: '토론 상태를 오래 받지 못했어요.',
      SERVER_ERROR: '서버에서 토론 진행 오류를 전달했어요.',
      UNKNOWN: '알 수 없는 실시간 오류가 발생했어요.',
    };

    throw new AudienceShareDisplayError(
      t(errorMessages[state.error.code]),
      state.error,
    );
  }

  const renderContent = () => {
    console.log(`# Status = ${state.status}`);

    if (state.status === 'connecting') {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <LoadingSpinner size="h-12 w-12" />
        </div>
      );
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
        return (
          <div className="flex h-full w-full items-center justify-center">
            <AudienceNormalTimer
              remainingTime={
                normalCountdown.currentSeconds ?? displayData.singleTime
              }
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
              currentTeam={displayData.currentTeam!}
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

  return (
    <DefaultLayout>
      <DefaultLayout.ContentContainer>
        <div className="relative flex h-full w-full flex-col">
          {renderContent()}
        </div>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
