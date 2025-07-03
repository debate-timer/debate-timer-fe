import { useParams } from 'react-router-dom';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import TimeBasedTimer from './components/TimeBasedTimer';
import FirstUseToolTip from './components/FirstUseToolTip';
import HeaderTableInfo from '../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../components/HeaderTitle/HeaderTitle';
import IconButton from '../../components/IconButton/IconButton';
import { IoHelpCircle } from 'react-icons/io5';
import { FaExchangeAlt } from 'react-icons/fa';
import NormalTimer from './components/NormalTimer';
import RoundControlButton from '../../components/RoundControlButton/RoundControlButton';
import DialogModal from '../../components/DialogModal/DialogModal';
import { bgColorMap, useTimerPageState } from './hooks/useTimerPageState';
import { useTimerHotkey } from './hooks/useTimerHotkey';

export default function TimerPage() {
  const pathParams = useParams();
  const tableId = Number(pathParams.id);
  const state = useTimerPageState(tableId);
  useTimerHotkey(state);
  const {
    warningBellRef,
    finishBellRef,
    navigate,
    data,
    isFirst,
    setIsFirst,
    IS_FIRST,
    TRUE,
    FALSE,
    closeUseTooltipModal,
    UseToolTipWrapper,
    openLoginAndStoreModal,
    closeLoginAndStoreModal,
    LoginAndStoreModalWrapper,
    bg,
    isAdditionalTimerOn,
    setIsAdditionalTimerOn,
    savedTimer,
    saveTimer,
    isTimerChangeable,
    index,
    timer1,
    timer2,
    normalTimer,
    prosConsSelected,
    setProsConsSelected,
    goToOtherItem,
    switchCamp,
    oAuthLogin,
    isGuestFlow,
  } = state;

  if (!data) {
    return null;
  }

  return (
    <>
      <audio ref={warningBellRef} src="/sounds/bell-warning.mp3" />
      <audio ref={finishBellRef} src="/sounds/bell-finish.mp3" />

      <DefaultLayout>
        {/* Headers */}
        <DefaultLayout.Header>
          <DefaultLayout.Header.Left>
            <HeaderTableInfo
              name={
                data === undefined || data.info.name.trim() === ''
                  ? '테이블 이름 없음'
                  : data.info.name
              }
            />
          </DefaultLayout.Header.Left>
          <DefaultLayout.Header.Center>
            <HeaderTitle
              title={
                data === undefined || data.info.agenda.trim() === ''
                  ? '주제 없음'
                  : data.info.agenda
              }
            />
          </DefaultLayout.Header.Center>
          <DefaultLayout.Header.Right>
            <IconButton
              icon={<IoHelpCircle size={24} />}
              onClick={() => {
                if (isFirst) {
                  setIsFirst(false);
                  localStorage.setItem(IS_FIRST, FALSE);
                } else {
                  setIsFirst(true);
                  localStorage.setItem(IS_FIRST, TRUE);
                }
              }}
            />
          </DefaultLayout.Header.Right>
        </DefaultLayout.Header>

        {/* Containers */}
        <DefaultLayout.ContentContainer noPadding={true}>
          <div
            className={`flex h-full w-full flex-col items-center justify-center space-y-[25px] xl:space-y-[40px] ${bgColorMap[bg]}`}
          >
            {/* 타이머 두 개 + ENTER 버튼 */}
            {data.table[index].boxType === 'NORMAL' && (
              <NormalTimer
                isAdditionalTimerOn={isAdditionalTimerOn}
                onStart={() => normalTimer.startTimer()}
                onPause={() => normalTimer.pauseTimer()}
                onReset={() => normalTimer.resetTimer()}
                addOnTimer={(delta: number) =>
                  normalTimer.setTimer((normalTimer.timer ?? 0) + delta)
                }
                isRunning={normalTimer.isRunning}
                timer={normalTimer.timer ?? 0}
                isLastItem={
                  data !== undefined && index === data.table.length - 1
                }
                isFirstItem={index === 0}
                goToOtherItem={(isPrev: boolean) => {
                  goToOtherItem(isPrev);
                  normalTimer.resetTimer();
                }}
                isTimerChangeable={isTimerChangeable}
                onChangingTimer={() => {
                  normalTimer.pauseTimer();

                  if (!isAdditionalTimerOn) {
                    saveTimer(normalTimer.timer ?? 0);
                    normalTimer.setTimer(0);
                  } else {
                    normalTimer.setTimer(savedTimer);
                  }

                  setIsAdditionalTimerOn(!isAdditionalTimerOn);
                }}
                item={data.table[index]}
                teamName={
                  data.table[index].stance === 'NEUTRAL'
                    ? null
                    : data.table[index].stance === 'PROS'
                      ? data.info.prosTeamName
                      : data.info.consTeamName
                }
              />
            )}
            {data.table[index].boxType === 'TIME_BASED' && (
              <div className="relative flex flex-row items-center justify-center space-x-[30px]">
                {/* 왼쪽 타이머 */}
                <TimeBasedTimer
                  onStart={() => timer1.startTimer()}
                  onPause={() => timer1.pauseTimer()}
                  onReset={() => timer1.resetCurrentTimer()}
                  addOnTimer={(delta: number) =>
                    timer1.setTimers(timer1.totalTimer ?? 0 + delta)
                  }
                  isRunning={timer1.isRunning}
                  timer={timer1.totalTimer ?? 0}
                  isLastItem={
                    data !== undefined && index === data.table.length - 1
                  }
                  isFirstItem={index === 0}
                  goToOtherItem={(isPrev: boolean) => {
                    goToOtherItem(isPrev);
                    timer1.resetTimerForNextPhase();
                  }}
                  isTimerChangeable={isTimerChangeable}
                  onChangingTimer={() => {
                    timer1.pauseTimer();
                    setIsAdditionalTimerOn(!isAdditionalTimerOn);
                  }}
                  item={data.table[index]}
                  speakingTimer={timer1.speakingTimer}
                  isSelected={prosConsSelected === 'pros'}
                  onActivate={() => {
                    if (timer1.isDone) return;
                    if (prosConsSelected === 'cons') {
                      if (timer2.isRunning) {
                        timer2.pauseTimer();
                        timer1.startTimer();
                        setProsConsSelected('pros');
                      } else {
                        timer2.pauseTimer();
                        setProsConsSelected('pros');
                      }
                    }
                  }}
                  prosCons="pros"
                  teamName={data.info.prosTeamName}
                />

                {/* 오른쪽 타이머 */}
                <TimeBasedTimer
                  onStart={() => timer2.startTimer()}
                  onPause={() => timer2.pauseTimer()}
                  onReset={() => timer2.resetCurrentTimer()}
                  addOnTimer={(delta: number) =>
                    timer2.setTimers(timer2.totalTimer ?? 0 + delta)
                  }
                  isRunning={timer2.isRunning}
                  timer={timer2.totalTimer ?? 0}
                  isLastItem={
                    data !== undefined && index === data.table.length - 1
                  }
                  isFirstItem={index === 0}
                  goToOtherItem={(isPrev: boolean) => {
                    goToOtherItem(isPrev);
                    timer2.resetTimerForNextPhase();
                  }}
                  isTimerChangeable={isTimerChangeable}
                  onChangingTimer={() => {
                    timer2.pauseTimer();
                    setIsAdditionalTimerOn(!isAdditionalTimerOn);
                  }}
                  item={data.table[index]}
                  speakingTimer={timer2.speakingTimer}
                  isSelected={prosConsSelected === 'cons'}
                  onActivate={() => {
                    if (timer2.isDone) return;
                    if (prosConsSelected === 'pros') {
                      if (timer1.isRunning) {
                        timer1.pauseTimer();
                        timer2.startTimer();
                        setProsConsSelected('cons');
                      } else {
                        timer1.pauseTimer();
                        setProsConsSelected('cons');
                      }
                    }
                  }}
                  prosCons="cons"
                  teamName={data.info.consTeamName}
                />

                {/* ENTER 버튼 */}
                <button
                  onClick={() => {
                    switchCamp();
                  }}
                  className="absolute left-1/2 top-1/2 flex h-[78px] w-[78px] -translate-x-[70px] -translate-y-6 flex-col items-center justify-center rounded-full bg-neutral-600 text-white shadow-lg transition hover:bg-neutral-500 lg:h-[100px] lg:w-[100px] lg:-translate-x-20 lg:-translate-y-8"
                >
                  <FaExchangeAlt className="text-[28px] lg:text-[36px]" />
                  <span className="text-[12px] font-semibold lg:text-[18px] lg:font-bold">
                    ENTER
                  </span>
                </button>
              </div>
            )}
            {/* Round control buttons on the bottom side */}
            {data && (
              <div className="flex flex-row space-x-1 xl:space-x-8">
                <div className="flex h-[70px] w-[175px] items-center justify-center lg:w-[200px]">
                  {index === 0 && <></>}
                  {index !== 0 && (
                    <RoundControlButton
                      type="PREV"
                      onClick={() => {
                        setIsAdditionalTimerOn(false);
                        goToOtherItem(true);
                      }}
                    />
                  )}
                </div>

                <div className="flex h-[70px] w-[175px] items-center justify-center lg:w-[200px]">
                  {index === data.table.length - 1 && (
                    <RoundControlButton
                      type="DONE"
                      onClick={() => {
                        if (isGuestFlow()) {
                          openLoginAndStoreModal();
                        } else {
                          navigate(`/overview/customize/${tableId}`);
                        }
                      }}
                    />
                  )}
                  {index !== data.table.length - 1 && (
                    <RoundControlButton
                      type="NEXT"
                      onClick={() => {
                        setIsAdditionalTimerOn(false);
                        goToOtherItem(false);
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </DefaultLayout.ContentContainer>
      </DefaultLayout>

      {/** Tooltip */}
      <UseToolTipWrapper>
        <FirstUseToolTip
          onClose={() => {
            closeUseTooltipModal();
            setIsFirst(false);
            localStorage.setItem(IS_FIRST, FALSE);
          }}
        />
      </UseToolTipWrapper>
      {/** Login And DataStore*/}
      <LoginAndStoreModalWrapper closeButtonColor="text-neutral-1000">
        <DialogModal
          left={{
            text: '아니오',
            onClick: () => {
              closeLoginAndStoreModal();
            },
          }}
          right={{
            text: '네',
            onClick: () => {
              closeLoginAndStoreModal();
              oAuthLogin();
            },
            isBold: true,
          }}
        >
          <div className="break-keep px-20 py-10 text-center text-xl font-bold">
            토론을 끝내셨군요! <br />
            지금까지의 시간표를 로그인하고 저장할까요?
          </div>
        </DialogModal>
      </LoginAndStoreModalWrapper>
    </>
  );
}
