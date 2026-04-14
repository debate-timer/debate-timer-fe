import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import HeaderTableInfo from '../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../components/HeaderTitle/HeaderTitle';
import { useTimerPageState } from './hooks/useTimerPageState';
import { useTimerHotkey } from './hooks/useTimerHotkey';
import useDebateTracking from './hooks/useDebateTracking';
import RoundControlRow from './components/RoundControlRow';
import TimerView from './components/TimerView';
import { FirstUseToolTipModal } from './components/FirstUseToolTipModal';
import { LoginAndStoreModal } from './components/LoginAndStoreModal';
import { useTimerPageModal } from './hooks/useTimerPageModal';
import { bgColorMap } from '../../type/type';
import DTHelp from '../../components/icons/Help';
import clsx from 'clsx';
import ErrorIndicator from '../../components/ErrorIndicator/ErrorIndicator';
import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator';
import { isGuestFlow } from '../../util/sessionStorage';
import useAnalytics from '../../hooks/useAnalytics';
import { consumeTemplateOrigin } from '../../util/analytics/templateOrigin';
import { RiFullscreenFill, RiFullscreenExitFill } from 'react-icons/ri';
import DTVolume from '../../components/icons/Volume';
import VolumeBar from '../../components/VolumeBar/VolumeBar';

// 토론 타이머 실행, 라운드 이동, 종료 흐름을 관리하는 메인 페이지다.
export default function TimerPage() {
  const { t } = useTranslation();
  const pathParams = useParams();
  const tableId = Number(pathParams.id);
  const {
    openUseTooltipModal,
    UseToolTipWrapper,
    closeUseTooltipModal,
    LoginAndStoreModalWrapper,
    closeLoginAndStoreModal,
    openLoginAndStoreModalOrGoToDebateEndPage,
  } = useTimerPageModal(tableId);

  const state = useTimerPageState(tableId);
  // timer_started, debate_completed, debate_abandoned 관련 추적 상태를 관리한다.
  const { trackTimerStarted, trackDebateCompleted, updateProgress } =
    useDebateTracking();
  const { trackEvent } = useAnalytics();

  useTimerHotkey(state);
  const timerStartedRef = useRef(false);
  const {
    data,
    bg,
    index,
    goToOtherItem,
    isLoading,
    isError,
    refetch,
    isVolumeBarOpen,
    toggleVolumeBar,
    volume,
    setVolume,
    isFullscreen,
    setFullscreen,
    toggleFullscreen,
    volumeRef,
  } = state;

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

  // 오류가 발생하면 재시도 가능한 에러 화면을 노출한다.
  if (isError) {
    return (
      <DefaultLayout>
        <DefaultLayout.ContentContainer>
          <ErrorIndicator onClickRetry={() => refetch()} />
        </DefaultLayout.ContentContainer>
      </DefaultLayout>
    );
  }

  // 로딩 또는 정상 상태에 맞는 타이머 화면을 렌더링한다.
  return (
    <>
      <DefaultLayout>
        <DefaultLayout.Header>
          <DefaultLayout.Header.Left>
            {!isLoading && data && (
              <HeaderTableInfo
                name={
                  data.info.name.trim() === ''
                    ? t('테이블 이름 없음')
                    : t(data.info.name)
                }
              />
            )}
          </DefaultLayout.Header.Left>
          <DefaultLayout.Header.Center>
            {!isLoading && data && (
              <HeaderTitle
                title={
                  data.info.agenda.trim() === ''
                    ? t('주제 없음')
                    : t(data.info.agenda)
                }
              />
            )}
          </DefaultLayout.Header.Center>
          <DefaultLayout.Header.Right>
            <button
              className="flex h-full items-center justify-center p-[4px]"
              aria-label={t('도움말')}
              title={t('도움말')}
              onClick={openUseTooltipModal}
            >
              <DTHelp className="h-full" />
            </button>

            <button
              className="flex aspect-square h-full items-center justify-center p-[4px]"
              title={t('전체 화면')}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <RiFullscreenExitFill className="h-full w-full" />
              ) : (
                <RiFullscreenFill className="h-full w-full" />
              )}
            </button>

            <div className="relative flex h-full flex-col" ref={volumeRef}>
              <button
                className="flex aspect-square h-full items-center justify-center p-[4px]"
                aria-label={t('볼륨 조절')}
                title={t('볼륨 조절')}
                onClick={toggleVolumeBar}
              >
                <DTVolume className="h-full w-full" />
              </button>

              {isVolumeBarOpen && (
                <div className="absolute -right-[60px] top-[48px]">
                  <VolumeBar
                    volume={volume}
                    onVolumeChange={(value: number) => setVolume(value)}
                  />
                </div>
              )}
            </div>
          </DefaultLayout.Header.Right>
        </DefaultLayout.Header>

        {/* Containers */}
        <DefaultLayout.ContentContainer noPadding={true}>
          {isLoading && <LoadingIndicator />}
          {!isLoading && (
            <div
              className={clsx(
                'relative flex h-full w-full flex-col items-center justify-center space-y-[32px] pb-[66px] xl:space-y-[60px]',
                bgColorMap[bg],
              )}
            >
              {/* 타이머 두 개 + ENTER 버튼 */}
              <TimerView state={state} />
              {/* Round control buttons on the bottom side */}
              {data && (
                <RoundControlRow
                  table={data.table}
                  index={index}
                  goToOtherItem={goToOtherItem}
                  openDoneModal={() => {
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

      {/* 첫 사용자를 위한 타이머 사용 안내 모달이다. */}
      <FirstUseToolTipModal
        Wrapper={UseToolTipWrapper}
        onClose={closeUseTooltipModal}
      />

      {/* 토론 종료 후 로그인 저장 여부를 묻는 모달이다. */}
      <LoginAndStoreModal
        Wrapper={LoginAndStoreModalWrapper}
        onClose={closeLoginAndStoreModal}
      />
    </>
  );
}
