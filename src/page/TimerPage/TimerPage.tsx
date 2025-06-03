import { useCallback, useEffect, useRef, useState } from 'react';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import TimeBasedTimer from './components/TimeBasedTimer';
import { useNavigate, useParams } from 'react-router-dom';
import FirstUseToolTip from './components/FirstUseToolTip';
import HeaderTableInfo from '../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../components/HeaderTitle/HeaderTitle';
import IconButton from '../../components/IconButton/IconButton';
import { IoHelpCircle } from 'react-icons/io5';
import { useCustomTimer } from './hooks/useCustomTimer';
import { useGetDebateTableData } from '../../hooks/query/useGetDebateTableData';
import { FaExchangeAlt } from 'react-icons/fa';
import NormalTimer from './components/NormalTimer';
import { useNormalTimer } from './hooks/useNormalTimer';
import RoundControlButton from '../../components/RoundControlButton/RoundControlButton';
import { useModal } from '../../hooks/useModal';
import { isGuestFlow } from '../../util/sessionStorage';

type TimerState = 'default' | 'warning' | 'danger' | 'expired';
const bgColorMap: Record<TimerState, string> = {
  default: '',
  warning: 'bg-brand-main', // 30초 ~ 11초
  danger: 'bg-brand-sub3', // 10초 이하
  expired: 'bg-neutral-700', // 0초 이하
};

export default function TimerPage() {
  // ########## DECLARATION AREA ##########
  // Load sounds and prepare for bell-related constants
  const warningBellRef = useRef<HTMLAudioElement>(null);
  const finishBellRef = useRef<HTMLAudioElement>(null);
  const [isWarningBellOn, setWarningBell] = useState(false);
  const [isFinishBellOn, setFinishBell] = useState(false);

  // Parse params
  const pathParams = useParams();
  const tableId = Number(pathParams.id);
  const navigate = useNavigate();

  // Get query
  const { data } = useGetDebateTableData(tableId);

  // Prepare for tooltip-related constants
  const [isFirst, setIsFirst] = useState(false);
  const IS_FIRST = 'isFirst';
  const TRUE = 'true';
  const FALSE = 'false';
  const { openModal, closeModal, ModalWrapper } = useModal({
    onClose: () => {
      setIsFirst(false);
      localStorage.setItem(IS_FIRST, FALSE);
    },
    isCloseButtonExist: false,
  });

  // Prepare for changing background
  const [bg, setBg] = useState<TimerState>('default');

  // Prepare for additional timer
  const [isAdditionalTimerOn, setIsAdditionalTimerOn] = useState(false);
  const [savedTimer, saveTimer] = useState(0);
  const [isTimerChangeable, setIsTimerChangeable] = useState(true);

  // Prepare for index-related constants
  const [index, setIndex] = useState(0);

  // Prepare for timer hook
  const timer1 = useCustomTimer({});
  const timer2 = useCustomTimer({});
  const normalTimer = useNormalTimer();
  const [prosConsSelected, setProsConsSelected] = useState<'pros' | 'cons'>(
    'pros',
  );

  // 타이머의 이전상태를 저장(타종 31->30초인 상황에서만 타종하기위한 로직)
  const prevTimer1Ref = useRef<{
    speakingTimer: number | null;
    totalTimer: number | null;
  }>({
    speakingTimer: null,
    totalTimer: null,
  });

  const prevTimer2Ref = useRef<{
    speakingTimer: number | null;
    totalTimer: number | null;
  }>({
    speakingTimer: null,
    totalTimer: null,
  });

  const prevNormalTimerRef = useRef<number | null>(null);

  // 이전 또는 다음 차례로 이동하는 함수
  const goToOtherItem = useCallback(
    (isPrev: boolean) => {
      if (isPrev) {
        if (index > 0) {
          setIndex((prev) => prev - 1);
        }
      } else {
        if (data && index < data.table.length - 1) {
          setIndex((prev) => prev + 1);
        }
      }
    },
    [index, data],
  );

  // 발언 진영(pros/cons) 전환 함수 (ENTER 버튼 등에서 사용)
  const switchCamp = useCallback(() => {
    if (prosConsSelected === 'pros') {
      if (timer2.isDone) return;
      if (timer1.isRunning) {
        timer1.pauseTimer();
        timer2.startTimer();
        setProsConsSelected('cons');
      } else {
        timer1.pauseTimer();
        setProsConsSelected('cons');
      }
    } else if (prosConsSelected === 'cons') {
      if (timer1.isDone) return;
      if (timer2.isRunning) {
        if (timer1.isDone) return;
        timer2.pauseTimer();
        timer1.startTimer();
        setProsConsSelected('pros');
      } else {
        timer2.pauseTimer();
        setProsConsSelected('pros');
      }
    }
  }, [prosConsSelected, timer1, timer2]);

  // ########### useEffect AREA ###########
  // 로컬스토리지에 저장된 "최초 사용 여부" 확인 → 툴팁 띄울지 결정
  useEffect(() => {
    const storedIsFirst = localStorage.getItem(IS_FIRST);

    if (storedIsFirst === null) {
      setIsFirst(true);
    } else {
      setIsFirst(storedIsFirst.trim() === TRUE ? true : false);
    }

    if (isFirst) {
      openModal();
    }
  }, [isFirst, openModal]);

  // 타이머 상태에 따라 배경색(bg) 상태 설정
  useEffect(() => {
    const getBgStatus = () => {
      const boxType = data?.table[index].boxType;

      const getTimerStatus = (
        speakingTimer: number | null,
        totalTimer: number | null,
      ) => {
        const activeTimer = speakingTimer !== null ? speakingTimer : totalTimer;
        if (activeTimer !== null) {
          if (activeTimer > 10 && activeTimer <= 30) return 'warning';
          if (activeTimer >= 0 && activeTimer <= 10) return 'danger';
        }
        return 'default';
      };

      if (boxType === 'NORMAL') {
        if (!normalTimer.isRunning) return 'default';

        if (normalTimer.timer !== null) {
          if (normalTimer.timer > 10 && normalTimer.timer <= 30)
            return 'warning';
          if (normalTimer.timer >= 0 && normalTimer.timer <= 10)
            return 'danger';
          if (normalTimer.timer < 0) return 'expired';
          return 'default';
        }
      }

      if (boxType === 'TIME_BASED') {
        if (prosConsSelected === 'pros' && timer1.isRunning) {
          return getTimerStatus(timer1.speakingTimer, timer1.totalTimer);
        }
        if (prosConsSelected === 'cons' && timer2.isRunning) {
          return getTimerStatus(timer2.speakingTimer, timer2.totalTimer);
        }
      }

      return 'default';
    };

    setBg(getBgStatus());
  }, [
    normalTimer.isRunning,
    normalTimer.timer,
    timer1.isRunning,
    timer1.totalTimer,
    timer1.speakingTimer,
    timer2.isRunning,
    timer2.totalTimer,
    timer2.speakingTimer,
    prosConsSelected,
    index,
    data,
  ]);

  // 벨 소리 재생
  useEffect(() => {
    const shouldPlayWarningBell = () => {
      const isAnyTimerRunning =
        timer1.isRunning || timer2.isRunning || normalTimer.isRunning;
      if (!warningBellRef.current || !isAnyTimerRunning || !isWarningBellOn)
        return false;
      const waringTime = 30;
      const timerJustReached = (
        prevTime: number | null,
        currentTime: number | null,
        defaultTime: number | null,
      ) => {
        return (
          prevTime !== null &&
          prevTime > waringTime &&
          currentTime === waringTime &&
          defaultTime !== waringTime
        );
      };

      const isTimer1WarningTime =
        timer1.isRunning &&
        (timerJustReached(
          prevTimer1Ref.current.speakingTimer,
          timer1.speakingTimer,
          timer1.defaultTime.defaultSpeakingTimer,
        ) ||
          (timer1.speakingTimer === null &&
            timerJustReached(
              prevTimer1Ref.current.totalTimer,
              timer1.totalTimer,
              timer1.defaultTime.defaultTotalTimer,
            )));

      const isTimer2WarningTime =
        timer2.isRunning &&
        (timerJustReached(
          prevTimer2Ref.current.speakingTimer,
          timer2.speakingTimer,
          timer2.defaultTime.defaultSpeakingTimer,
        ) ||
          (timer2.speakingTimer === null &&
            timerJustReached(
              prevTimer2Ref.current.totalTimer,
              timer2.totalTimer,
              timer2.defaultTime.defaultTotalTimer,
            )));

      const isNormalTimerWarningTime =
        normalTimer.isRunning &&
        prevNormalTimerRef.current !== null &&
        prevNormalTimerRef.current > waringTime &&
        normalTimer.timer === waringTime &&
        normalTimer.defaultTimer !== waringTime;

      return (
        isTimer1WarningTime || isTimer2WarningTime || isNormalTimerWarningTime
      );
    };

    // 사용
    if (warningBellRef.current && shouldPlayWarningBell()) {
      warningBellRef.current.play();
    }

    const shouldPlayFinishBell = () => {
      const isTimer1Finished =
        timer1.isRunning &&
        (timer1.speakingTimer === 0 || timer1.totalTimer === 0);

      const isTimer2Finished =
        timer2.isRunning &&
        (timer2.speakingTimer === 0 || timer2.totalTimer === 0);

      const isNormalTimerFinished =
        normalTimer.isRunning && normalTimer.timer === 0;

      const isAnyTimerRunning =
        timer1.isRunning || timer2.isRunning || normalTimer.isRunning;
      return (
        isAnyTimerRunning &&
        isFinishBellOn &&
        (isTimer1Finished || isTimer2Finished || isNormalTimerFinished)
      );
    };

    // 사용
    if (finishBellRef.current && shouldPlayFinishBell()) {
      finishBellRef.current.play();
    }

    prevTimer1Ref.current = {
      speakingTimer: timer1.speakingTimer,
      totalTimer: timer1.totalTimer,
    };
    prevTimer2Ref.current = {
      speakingTimer: timer2.speakingTimer,
      totalTimer: timer2.totalTimer,
    };
    prevNormalTimerRef.current = normalTimer.timer;
  }, [
    isFinishBellOn,
    isWarningBellOn,
    timer1.isRunning,
    timer2.isRunning,
    normalTimer.isRunning,
    timer1.speakingTimer,
    timer1.totalTimer,
    timer1.defaultTime.defaultTotalTimer,
    timer1.defaultTime.defaultSpeakingTimer,
    timer2.speakingTimer,
    timer2.totalTimer,
    timer2.defaultTime.defaultSpeakingTimer,
    normalTimer.timer,
    normalTimer.defaultTimer,
    timer2.defaultTime.defaultTotalTimer,
  ]);

  // 새로운 index(차례)로 이동했을 때 → 타이머 초기화 및 세팅
  useEffect(() => {
    if (!data) return;

    const currentBox = data.table[index];
    const { warningBell, finishBell } = data.info;

    setWarningBell(warningBell);
    setFinishBell(finishBell);
    timer1.clearTimer();
    timer2.clearTimer();
    normalTimer.clearTimer();

    if (currentBox.boxType === 'NORMAL') {
      const defaultTime = currentBox.time ?? 0;
      normalTimer.setDefaultTimer(defaultTime);
      normalTimer.setTimer(defaultTime);
    } else if (currentBox.boxType === 'TIME_BASED') {
      normalTimer.clearTimer();

      const defaultTotalTimer = currentBox.timePerTeam;
      const defaultSpeakingTimer = currentBox.timePerSpeaking;

      [timer1, timer2].forEach((timer) => {
        timer.setDefaultTime({ defaultTotalTimer, defaultSpeakingTimer });
        timer.setTimers(defaultTotalTimer, defaultSpeakingTimer);
        timer.setIsSpeakingTimer(true);
        timer.setIsDone(false);
      });
    }
  }, [
    data,
    index,
    timer1.setDefaultTime,
    timer1.setTimers,
    timer2.setDefaultTime,
    timer2.setTimers,
    normalTimer.setDefaultTimer,
    normalTimer.setTimer,
  ]);

  // 키보드 단축키 제어
  useEffect(() => {
    const boxType = data?.table[index].boxType;
    const handleKeyDown = (event: KeyboardEvent) => {
      const keysToDisable = [
        'Space',
        'ArrowLeft',
        'ArrowRight',
        'KeyR',
        'KeyA',
        'KeyL',
        'Enter',
      ];

      if (keysToDisable.includes(event.key)) {
        event.preventDefault();
      }
      if (event.target instanceof HTMLElement) {
        event.target.blur();
      }

      const toggleTimer = (timer: typeof timer1 | typeof timer2) => {
        if (timer.isRunning) {
          timer.pauseTimer();
        } else {
          timer.startTimer();
        }
      };

      switch (event.code) {
        case 'Space':
          if (boxType === 'NORMAL') {
            if (normalTimer.isRunning) {
              normalTimer.pauseTimer();
            } else {
              normalTimer.startTimer();
            }
          } else {
            if (prosConsSelected === 'pros') {
              toggleTimer(timer1);
            } else if (prosConsSelected === 'cons') {
              toggleTimer(timer2);
            }
          }
          break;
        case 'ArrowLeft':
          goToOtherItem(true);
          break;
        case 'ArrowRight':
          goToOtherItem(false);
          break;
        case 'KeyR':
          if (boxType === 'NORMAL') {
            normalTimer.resetTimer();
          } else {
            if (prosConsSelected === 'pros') {
              timer1.resetCurrentTimer();
            } else {
              timer2.resetCurrentTimer();
            }
          }
          break;
        case 'KeyA':
          if (!timer1.isDone) {
            setProsConsSelected('pros');
            if (timer2.isRunning) timer2.pauseTimer();
          }
          break;
        case 'KeyL':
          if (!timer2.isDone) {
            setProsConsSelected('cons');
            if (timer1.isRunning) timer1.pauseTimer();
          }
          break;
        case 'Enter':
          switchCamp();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    goToOtherItem,
    prosConsSelected,
    timer1,
    timer2,
    setProsConsSelected,
    switchCamp,
  ]);

  // 테이블에 작전시간 발언이 있는 경우 작전시간 타이머 변경 비활성화
  useEffect(() => {
    if (data) {
      data.table.forEach((value) => {
        if (value.speechType === '작전 시간') {
          setIsTimerChangeable(false);
        }
      });
    }
  });

  // 작전시간 타이머가 켜져 있고, 시간이 0이 되었을 때 → 저장된 시간으로 되돌림
  useEffect(() => {
    if (
      isAdditionalTimerOn &&
      normalTimer.timer === 0 &&
      normalTimer.isRunning
    ) {
      normalTimer.pauseTimer();
      normalTimer.setTimer(savedTimer);
      setIsAdditionalTimerOn(!isAdditionalTimerOn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAdditionalTimerOn,
    normalTimer.timer,
    savedTimer,
    normalTimer.pauseTimer,
    setIsAdditionalTimerOn,
    normalTimer.setTimer,
    normalTimer.isRunning,
  ]);

  //진영(pros/cons)이 바뀌면 → 상대 타이머 초기화
  useEffect(() => {
    if (prosConsSelected === 'cons') {
      if (timer1.speakingTimer === null) return;
      timer1.resetTimerForNextPhase();
    } else if (prosConsSelected === 'pros') {
      if (timer2.speakingTimer === null) return;
      timer2.resetTimerForNextPhase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prosConsSelected]);

  //타이머가 0초가 되면 자동으로 일시정지
  useEffect(() => {
    if (timer1.speakingTimer === 0 || timer1.totalTimer === 0) {
      timer1.pauseTimer();
    } else if (timer2.speakingTimer === 0 || timer2.totalTimer === 0) {
      timer2.pauseTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timer1.speakingTimer,
    timer1.totalTimer,
    timer2.speakingTimer,
    timer2.totalTimer,
  ]);

  //speakingTimer or totalTimer가 0초면 → 타이머 종료 처리 (isDone = true)
  useEffect(() => {
    if (prosConsSelected === 'pros') {
      if (timer1.speakingTimer === null) {
        if (timer1.totalTimer === 0) {
          timer1.setIsDone(true);
        }
      } else {
        if (timer1.speakingTimer === 0) {
          timer1.setIsDone(true);
        }
      }
    } else if (prosConsSelected === 'cons') {
      if (timer2.speakingTimer === null) {
        if (timer2.totalTimer === 0) {
          timer2.setIsDone(true);
        }
      } else {
        if (timer2.speakingTimer === 0) {
          timer2.setIsDone(true);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    prosConsSelected,
    timer1.totalTimer,
    timer1.speakingTimer,
    timer2.totalTimer,
    timer2.speakingTimer,
  ]);
  // ########### COMPONENT AREA ###########
  if (!data) {
    return;
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
                          // TODO: have to add modal here
                          navigate(`/overview/customize/guest`);
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
      <ModalWrapper>
        <FirstUseToolTip
          onClose={() => {
            closeModal();
            setIsFirst(false);
            localStorage.setItem(IS_FIRST, FALSE);
          }}
        />
      </ModalWrapper>
    </>
  );
}
