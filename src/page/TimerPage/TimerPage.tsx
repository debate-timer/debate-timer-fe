import { parsePositiveId } from '../../util/headerNavigation';
import TimerHeader from '../../layout/components/header/TimerHeader';
import TimerHeaderTools from '../../layout/components/header/TimerHeaderTools';
import DebateMenu from './components/DebateMenu';
import DebateFeatureIndicators from './components/DebateFeatureIndicators';
import DebateLogoutDialog from './components/DebateLogoutDialog';
import useDebateControls from './hooks/useDebateControls';
import useDebateLogout from './hooks/useDebateLogout';
import useGlobalSettings from '../../hooks/useGlobalSettings';
import useLoginPrompt from '../../hooks/useLoginPrompt';
import LoginPrompt from '../../components/LoginPrompt/LoginPrompt';
import { buildLangPath, isSupportedLang } from '../../util/languageRouting';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { useTimerPageState } from './hooks/useTimerPageState';
import { useTimerHotkey } from './hooks/useTimerHotkey';
import useDebateTracking from './hooks/useDebateTracking';
import RoundControlRow from './components/RoundControlRow';
import TimerView from './components/TimerView';
import { FirstUseToolTipModal } from './components/FirstUseToolTipModal';
import { LoginAndStoreModal } from './components/LoginAndStoreModal';
import { useTimerPageModal } from './hooks/useTimerPageModal';
import { bgColorMap } from '../../types/type';
import DTHelp from '../../components/icons/Help';
import clsx from 'clsx';
import ErrorIndicator from '../../components/ErrorIndicator/ErrorIndicator';
import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator';
import { isGuestFlow } from '../../util/sessionStorage';
import { useEnsureGuestTable } from '../../hooks/useEnsureGuestTable';
import useAnalytics from '../../hooks/useAnalytics';
import { consumeTemplateOrigin } from '../../util/analytics/templateOrigin';
import { isLoggedIn } from '../../util/accessToken';
import { SocketEventType, TimerEventTypes } from '../../apis/sockets/type';
import { isTimerEventType } from '../../apis/sockets/util';
import AnswerTimeGuideModal from './components/AnswerTimeGuideModal';
import { getRemainingTimeForShare } from './getRemainingTimeForShare';
import { buildTimerPayloadForShare } from './buildTimerPayloadForShare';
import TranscriptLeaveModal from './components/TranscriptLeaveModal';
import useTranscriptLeaveGuard from './hooks/useTranscriptLeaveGuard';
import useFeatureFlag from '../../hooks/useFeatureFlag';
import { toRecognitionLang } from '../../util/speechRecognition';

// 피처 플래그
const IS_LIVE_SHARE_ENABLED = true;

// 토론 타이머 실행, 라운드 이동, 종료 흐름을 관리하는 메인 페이지다.
interface SharedTimes {
  remainingTime: number | null;
  prosTotalTime: number | null;
  consTotalTime: number | null;
}

export default function TimerPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  if (id !== 'guest' && parsePositiveId(id) === undefined) {
    return (
      <DefaultLayout>
        <DefaultLayout.ContentContainer>
          <ErrorIndicator>{t('테이블 ID가 올바르지 않습니다.')}</ErrorIndicator>
        </DefaultLayout.ContentContainer>
      </DefaultLayout>
    );
  }
  return <TimerPageSession key={id} />;
}

function TimerPageSession() {
  const { t, i18n } = useTranslation();
  const pathParams = useParams();
  useEnsureGuestTable(pathParams.id);
  const tableId = Number(pathParams.id);
  const {
    openUseTooltipModal,
    UseToolTipWrapper,
    isAnswerTimeGuideOpen,
    isUseTooltipOpen,
    isLoginAndStoreOpen,
    closeUseTooltipModal,
    closeAnswerTimeGuideModal,
    LoginAndStoreModalWrapper,
    closeLoginAndStoreModal,
    openLoginAndStoreModalOrGoToDebateEndPage,
  } = useTimerPageModal(tableId);

  const state = useTimerPageState(tableId);
  // timer_started, debate_completed, debate_abandoned 관련 추적 상태를 관리한다.
  const { trackTimerStarted, trackDebateCompleted, updateProgress } =
    useDebateTracking();
  const { trackEvent } = useAnalytics();

  const timerStartedRef = useRef(false);
  const {
    data,
    bg,
    index,
    goToOtherItem,
    isLoading,
    isError,
    refetch,
    isFullscreen,
    setFullscreen,
    prosConsSelected,
    timer1,
    timer2,
    normalTimer,
  } = state;
  const timerType = data && data.table[index].boxType;

  // 토론 기록: 타이머가 실행되는 동안의 발언을 현재 타임박스(자유토론은 현재 팀) 구간으로 기록한다.
  // 기록을 켤 때 크롬 실시간 인식(RPC)과 Soniox 구간 배치 전사 중 하나를 고른다.
  // 피쳐 플래그(TRANSCRIPT)를 부여받은 회원에게만 보여준다.
  const isMemberFlow = isLoggedIn() && !isGuestFlow();
  const { isEnabled: hasTranscriptFlag } = useFeatureFlag('TRANSCRIPT', {
    enabled: isMemberFlow,
  });
  const isTranscribeAvailable = isMemberFlow && hasTranscriptFlag;
  const [pauseAdditionalRevision, setPauseAdditionalRevision] = useState(0);
  const { pauseTimer: pauseNormalTimer } = normalTimer;
  const { pauseTimer: pauseProsTimer } = timer1;
  const { pauseTimer: pauseConsTimer } = timer2;
  const stopTimers = useCallback(() => {
    pauseNormalTimer();
    pauseProsTimer();
    pauseConsTimer();
    setPauseAdditionalRevision((current) => current + 1);
  }, [pauseNormalTimer, pauseProsTimer, pauseConsTimer]);
  const login = useLoginPrompt();
  const { controller: settingsController } = useGlobalSettings();
  const navigate = useNavigate();
  const syncRequestHandlerRef = useRef<() => void>(() => {});
  const controls = useDebateControls({
    tableId,
    timeBoxIndex: index,
    team: timerType === 'TIME_BASED' ? prosConsSelected : null,
    isRunning: normalTimer.isRunning || timer1.isRunning || timer2.isRunning,
    lang: toRecognitionLang(i18n.resolvedLanguage ?? i18n.language),
    canShare: IS_LIVE_SHARE_ENABLED && isMemberFlow && !!data,
    canTranscribe: isTranscribeAvailable && !!data,
    stopTimers,
    isInputBlocked: isUseTooltipOpen || isLoginAndStoreOpen || login.isOpen,
    onSyncRequest: () => syncRequestHandlerRef.current(),
  });
  const logout = useDebateLogout({
    interrupt: controls.interrupt,
    stopSharing: controls.share.stopSharing,
    exitFullscreen: async () => {
      await setFullscreen(false);
    },
    issueSettings: () => settingsController.issueBeforeLogout(),
    onSuccess: () => {
      const lang = isSupportedLang(i18n.language) ? i18n.language : 'ko';
      navigate(buildLangPath('/', lang), { replace: true });
    },
  });
  const isInputBlocked = controls.isInputBlocked || logout.isConfirmOpen;
  const transcriptLeaveGuard = useTranscriptLeaveGuard({
    tableId,
    isRecording:
      isTranscribeAvailable &&
      controls.transcript.isEnabled &&
      !controls.isInterrupted,
  });
  const remainingTime = getRemainingTimeForShare({
    timerType,
    normalTimer: normalTimer.timer,
    currentTeam: prosConsSelected,
    prosTimer: timer1,
    consTimer: timer2,
  });

  // 토론 종료 이벤트를 발행했는지 여부 (이후 상태 공유 요청에는 FINISHED로 응답)
  const isDebateFinishedRef = useRef(false);

  const { issueEvent, isSocketConnected } = controls.share;
  // 현재 타이머 상태로 청중 공유용 페이로드 생성
  const isNormalTimerRunning = normalTimer.isRunning;
  const isProsTimerRunning = timer1.isRunning;
  const isConsTimerRunning = timer2.isRunning;
  const prosTotalTime = timer1.totalTimer;
  const consTotalTime = timer2.totalTimer;
  const buildTimerPayload = useCallback(
    (eventType: TimerEventTypes, sharedTimes?: SharedTimes) => {
      const isTimeBasedTimerRunning =
        prosConsSelected === 'PROS' ? isProsTimerRunning : isConsTimerRunning;

      return buildTimerPayloadForShare({
        eventType,
        timerType,
        sequence: index,
        currentTeam: prosConsSelected,
        remainingTime: sharedTimes ? sharedTimes.remainingTime : remainingTime,
        isCurrentTimerRunning:
          timerType === 'NORMAL'
            ? isNormalTimerRunning
            : isTimeBasedTimerRunning,
        prosTotalTime: sharedTimes ? sharedTimes.prosTotalTime : prosTotalTime,
        consTotalTime: sharedTimes ? sharedTimes.consTotalTime : consTotalTime,
      });
    },
    [
      consTotalTime,
      index,
      isConsTimerRunning,
      isNormalTimerRunning,
      isProsTimerRunning,
      prosConsSelected,
      prosTotalTime,
      remainingTime,
      timerType,
    ],
  );

  // 자유토론 초기화 직후 공유할 시간을 만든다.
  // 이벤트 발행 시점에는 React 상태가 아직 초기화 전 값이므로, 현재 팀은 턴 시작 시간을 직접 읽는다.
  const getResetSharedTimes = (): SharedTimes | undefined => {
    if (timerType !== 'TIME_BASED') {
      return undefined;
    }

    const prosTimes =
      prosConsSelected === 'PROS' ? timer1.getTurnStartTimes() : timer1;
    const consTimes =
      prosConsSelected === 'CONS' ? timer2.getTurnStartTimes() : timer2;

    return {
      remainingTime: getRemainingTimeForShare({
        timerType,
        normalTimer: normalTimer.timer,
        currentTeam: prosConsSelected,
        prosTimer: {
          totalTimer: prosTimes.totalTimer,
          speakingTimer: prosTimes.speakingTimer,
          isSpeakingTimerAvailable: timer1.isSpeakingTimerAvailable,
        },
        consTimer: {
          totalTimer: consTimes.totalTimer,
          speakingTimer: consTimes.speakingTimer,
          isSpeakingTimerAvailable: timer2.isSpeakingTimerAvailable,
        },
      }),
      prosTotalTime: prosTimes.totalTimer,
      consTotalTime: consTimes.totalTimer,
    };
  };

  // 타이머 이벤트를 핸들링하는 래퍼 함수 선언
  const handleTimerEvent = (invoke: () => void, eventType: SocketEventType) => {
    if (isInputBlocked) {
      return;
    }
    // 이벤트 실행
    invoke();

    // 종료 후 다른 이벤트를 발행하면 토론이 다시 진행 중인 것으로 본다
    isDebateFinishedRef.current = eventType === 'FINISHED';

    // 만약 소켓 열려 있으면, 발송
    if (!isSocketConnected) {
      return;
    }

    if (!isTimerEventType(eventType)) {
      issueEvent(eventType, null);
      return;
    }

    const payload = buildTimerPayload(
      eventType,
      eventType === 'RESET' ? getResetSharedTimes() : undefined,
    );
    if (payload === null) {
      return;
    }

    // 이벤트 발행
    issueEvent(eventType, payload);
  };

  // 상태 공유용 남은 시간을 실제 시각 기준으로 보정해 만든다.
  // 사회자 탭이 백그라운드에 있는 동안 브라우저가 인터벌을 억제하면 화면의 남은 시간이
  // 밀려 있으므로, 그대로 공유하면 청중이 지난 시간을 다시 보게 된다.
  const buildSyncPayload = useCallback(() => {
    const caughtUpNormalTime = normalTimer.catchUpToClock();
    const caughtUpProsTimes = timer1.catchUpToClock();
    const caughtUpConsTimes = timer2.catchUpToClock();

    const caughtUpRemainingTime = getRemainingTimeForShare({
      timerType,
      normalTimer: caughtUpNormalTime,
      currentTeam: prosConsSelected,
      prosTimer: {
        ...caughtUpProsTimes,
        isSpeakingTimerAvailable: timer1.isSpeakingTimerAvailable,
      },
      consTimer: {
        ...caughtUpConsTimes,
        isSpeakingTimerAvailable: timer2.isSpeakingTimerAvailable,
      },
    });

    return buildTimerPayloadForShare({
      eventType: 'SYNC',
      timerType,
      sequence: index,
      currentTeam: prosConsSelected,
      remainingTime: caughtUpRemainingTime,
      isCurrentTimerRunning:
        timerType === 'NORMAL'
          ? isNormalTimerRunning
          : prosConsSelected === 'PROS'
            ? isProsTimerRunning
            : isConsTimerRunning,
      prosTotalTime: caughtUpProsTimes.totalTimer,
      consTotalTime: caughtUpConsTimes.totalTimer,
    });
  }, [
    index,
    isConsTimerRunning,
    isNormalTimerRunning,
    isProsTimerRunning,
    normalTimer,
    prosConsSelected,
    timer1,
    timer2,
    timerType,
  ]);

  // 서버의 상태 공유 요청 시 현재 상태를 SYNC로 발행 (이미 종료했다면 FINISHED)
  // 폐기된 렌더의 상태를 캡처하지 않도록 커밋 이후에 핸들러를 갱신
  useEffect(() => {
    syncRequestHandlerRef.current = () => {
      if (isDebateFinishedRef.current) {
        issueEvent('FINISHED', null);
        return;
      }

      const payload = buildSyncPayload();
      if (payload === null) {
        return;
      }

      issueEvent('SYNC', payload);
    };
  }, [buildSyncPayload, issueEvent]);

  useTimerHotkey(state, handleTimerEvent, { isEnabled: !isInputBlocked });

  // timer_started 이벤트 발화 (데이터 로드 후 1회)
  useEffect(() => {
    if (data && !timerStartedRef.current) {
      timerStartedRef.current = true;
      trackTimerStarted({
        table_id: isGuestFlow() ? 'guest' : tableId,
        total_rounds: data.table.length,
      });

      // 템플릿 진입인 경우 template_used 이벤트 발화
      const origin = consumeTemplateOrigin();
      if (origin) {
        trackEvent('template_used', {
          organization_name: origin.organization_name,
          template_name: origin.template_name,
          template_label: `${origin.organization_name} - ${origin.template_name}`,
          table_id: isGuestFlow() ? 'guest' : tableId,
        });
      }
    }
  }, [data, tableId, trackTimerStarted, trackEvent]);

  // 라운드 진행 상황 업데이트
  useEffect(() => {
    if (data) {
      updateProgress(index + 1, data.table.length);
    }
  }, [index, data, updateProgress]);

  const header = (
    <TimerHeader
      name={data?.info.name}
      agenda={data?.info.agenda}
      isGuest={isGuestFlow()}
      actions={
        <TimerHeaderTools
          onLogin={() => login.requestLogin()}
          onLogout={logout.requestLogout}
        >
          <DebateFeatureIndicators statuses={controls.statuses} />
          <span
            className="h-6 w-px shrink-0 bg-neutral-300"
            aria-hidden="true"
          />
          <DebateMenu
            controls={controls}
            shareUnavailableReason={
              !isMemberFlow ? t('회원만 사용할 수 있는 기능입니다.') : undefined
            }
            transcriptUnavailableReason={
              !isMemberFlow
                ? t('회원만 사용할 수 있는 기능입니다.')
                : !hasTranscriptFlag
                  ? t('사용 권한이 필요한 기능입니다.')
                  : undefined
            }
            onLogin={
              !isMemberFlow
                ? () => {
                    controls.closeOverlay();
                    login.requestLogin();
                  }
                : undefined
            }
          />
          <button
            type="button"
            aria-label={t('도움말')}
            title={t('도움말')}
            className="flex size-11 items-center justify-center rounded-xl border border-neutral-300 p-2"
            onClick={openUseTooltipModal}
          >
            <DTHelp className="size-6" />
          </button>
        </TimerHeaderTools>
      }
    />
  );

  // 로딩 또는 정상 상태에 맞는 타이머 화면을 렌더링한다.
  return (
    <>
      <DefaultLayout header={header}>
        {/* Containers */}
        <DefaultLayout.ContentContainer noPadding={true}>
          {isError && <ErrorIndicator onClickRetry={() => refetch()} />}
          {isLoading && <LoadingIndicator />}
          {!isLoading && !isError && data && (
            <div
              inert={isInputBlocked}
              aria-disabled={isInputBlocked}
              className={clsx(
                'relative flex min-h-full w-full flex-col items-center justify-center space-y-[32px] pb-[66px] xl:space-y-[60px]',
                bgColorMap[bg],
              )}
            >
              {/* 타이머 두 개 + ENTER 버튼 */}
              <TimerView
                state={state}
                onEvent={handleTimerEvent}
                answerTime={controls.answerTime}
                isAnswerTimeEnabled={controls.isAnswerTimeEnabled}
                isInputBlocked={isInputBlocked}
                pauseAdditionalRevision={pauseAdditionalRevision}
              />
              {/* Round control buttons on the bottom side */}
              {data && (
                <RoundControlRow
                  table={data.table}
                  index={index}
                  goToOtherItem={goToOtherItem}
                  onEvent={handleTimerEvent}
                  openDoneModal={() => {
                    stopTimers();
                    // 전체 화면 상태에서 토론을 끝낼 경우, 전체 화면을 비활성화
                    if (isFullscreen) {
                      setFullscreen(false);
                    }

                    // debate_completed 이벤트를 먼저 기록해 cleanup의 debate_abandoned를 막는다.
                    trackDebateCompleted({
                      table_id: isGuestFlow() ? 'guest' : tableId,
                      total_rounds: data.table.length,
                    });

                    openLoginAndStoreModalOrGoToDebateEndPage();
                  }}
                  className="absolute bottom-[66px] left-1/2 -translate-x-1/2"
                />
              )}
            </div>
          )}
        </DefaultLayout.ContentContainer>
      </DefaultLayout>

      <LoginPrompt login={login} />
      <DebateLogoutDialog logout={logout} />

      {/* 첫 사용자를 위한 타이머 사용 안내 모달이다. */}
      <FirstUseToolTipModal
        Wrapper={UseToolTipWrapper}
        onClose={closeUseTooltipModal}
      />

      {/* 토론 세션당 한 번 답변시간 타이머 사용법을 안내한다. */}
      {isAnswerTimeGuideOpen && (
        <AnswerTimeGuideModal onClose={closeAnswerTimeGuideModal} />
      )}

      {/* 토론 기록 중 화면 이탈 시 속기록 유실을 안내하는 모달이다. */}
      <TranscriptLeaveModal
        isOpen={transcriptLeaveGuard.isLeaveModalOpen}
        onConfirm={transcriptLeaveGuard.confirmLeave}
        onCancel={transcriptLeaveGuard.cancelLeave}
      />

      {/* 토론 종료 후 로그인 저장 여부를 묻는 모달이다. */}
      <LoginAndStoreModal
        Wrapper={LoginAndStoreModalWrapper}
        onClose={closeLoginAndStoreModal}
      />
    </>
  );
}
