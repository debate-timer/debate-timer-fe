import { useCallback, useEffect, useRef, useState } from 'react';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import Timer from './components/Timer';
import { useParams } from 'react-router-dom';
import FirstUseToolTip from './components/FirstUseToolTip';
import HeaderTableInfo from '../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../components/HeaderTitle/HeaderTitle';
import IconButton from '../../components/IconButton/IconButton';
import { IoHelpCircle } from 'react-icons/io5';
import { useDebateTimer } from './hooks/useCustomTimer';
import { useGetCustomizeTableData } from '../../hooks/query/useGetCustomizeTableData';
import { FaArrowLeft, FaArrowRight, FaExchangeAlt } from 'react-icons/fa';
import NomalTimer from './components/NomalTimer';
import { useTimer } from './hooks/useTimer';

export default function TimerPage() {
  // ########## DECLARATION AREA ##########
  // Load sounds and prepare for bell-related constants
  const warningBellRef = useRef<HTMLAudioElement>(null);
  const finishBellRef = useRef<HTMLAudioElement>(null);
  // const [isWarningBellOn, setWarningBell] = useState(false);
  // const [isFinishBellOn, setFinishBell] = useState(false);

  // Parse params
  const pathParams = useParams();
  const tableId = Number(pathParams.id);

  // Get query
  const { data } = useGetCustomizeTableData(tableId);

  // Prepare for tooltip-related constants
  const [isFirst, setIsFirst] = useState(false);
  const IS_FIRST = 'isFirst';
  const TRUE = 'true';
  const FALSE = 'false';

  // Prepare for changing background
  const [bg, setBg] = useState('');

  // Prepare for additional timer
  const [isAdditionalTimerOn, setIsAdditionalTimerOn] = useState(false);
  const [savedTimer, saveTimer] = useState(0);
  const [isTimerChangeable, setIsTimerChangeable] = useState(true);

  // Prepare for index-related constants
  const [index, setIndex] = useState(0);
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

  // Prepare for timer hook
  const timer1 = useDebateTimer({});
  const timer2 = useDebateTimer({});
  const nomalTimer = useTimer();
  const [prosConsSelected, setProsConsSelected] = useState<'pros' | 'cons'>(
    'pros',
  );

  // ########### useEffect AREA ###########
  // Open tooltip when value of 'isFirst' is true
  useEffect(() => {
    const storedIsFirst = localStorage.getItem(IS_FIRST);

    if (storedIsFirst === null) {
      setIsFirst(true);
    } else {
      setIsFirst(storedIsFirst.trim() === TRUE ? true : false);
    }
  }, []);

  // Change background color
  useEffect(() => {
    if (data?.table[index].boxType === 'PARLIAMENTARY') {
      if (nomalTimer.isRunning) {
        if (nomalTimer.timer >= 0 && nomalTimer.timer <= 30) {
          setBg('gradient-timer-warning');
        } else {
          setBg('gradient-timer-timeout');
        }
      } else {
        setBg('');
      }
    } else if (data?.table[index].boxType === 'TIME_BASED') {
      if (prosConsSelected === 'pros') {
        if (timer1.isRunning) {
          if (timer1.speakingTimer !== null && timer1.totalTimer !== null) {
            if (timer1.speakingTimer >= 0 && timer1.speakingTimer <= 30) {
              setBg('gradient-timer-warning');
            } else if (
              timer1.speakingTimer >= 0 &&
              timer1.speakingTimer <= 10
            ) {
              setBg('gradient-timer-timeout');
            }
          } else if (
            timer1.speakingTimer === null &&
            timer1.totalTimer !== null
          ) {
            if (timer1.totalTimer > 10 && timer1.totalTimer <= 30) {
              setBg('gradient-timer-warning');
            } else if (timer1.totalTimer >= 0 && timer1.totalTimer <= 10) {
              setBg('gradient-timer-timeout');
            }
          } else {
            setBg('');
          }
        } else {
          setBg('');
        }
      } else if (prosConsSelected === 'cons') {
        if (timer2.isRunning) {
          if (timer2.speakingTimer !== null && timer2.totalTimer !== null) {
            if (timer2.speakingTimer >= 0 && timer2.speakingTimer <= 30) {
              setBg('gradient-timer-warning');
            } else if (
              timer2.speakingTimer >= 0 &&
              timer2.speakingTimer <= 10
            ) {
              setBg('gradient-timer-timeout');
            }
          } else if (
            timer2.speakingTimer === null &&
            timer2.totalTimer !== null
          ) {
            if (timer2.totalTimer >= 0 && timer2.totalTimer <= 30) {
              setBg('gradient-timer-warning');
            } else if (timer2.totalTimer >= 0 && timer2.totalTimer <= 10) {
              setBg('gradient-timer-timeout');
            }
          } else {
            setBg('');
          }
        } else {
          setBg('');
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    nomalTimer.isRunning,
    nomalTimer.timer,
    timer1.isRunning,
    timer1.totalTimer,
    timer1.speakingTimer,
    timer2.isRunning,
    timer2.totalTimer,
    timer2.speakingTimer,
    index,
  ]);

  // Play bells
  // useEffect(() => {
  //   if (
  //     warningBellRef.current &&
  //     isRunning &&
  //     isWarningBellOn &&
  //     timer === 30
  //   ) {
  //     warningBellRef.current.play();
  //   }

  //   if (finishBellRef.current && isRunning && isFinishBellOn && timer === 0) {
  //     finishBellRef.current.play();
  //   }
  // }, [timer, isFinishBellOn, isWarningBellOn, isRunning]);

  // Initiate timer

  useEffect(() => {
    if (data) {
      if (data.table[index].boxType === 'PARLIAMENTARY') {
        nomalTimer.setDefaultValue(data.table[index].time ?? 0);
        nomalTimer.setTimer(data.table[index].time ?? 0);
        // setWarningBell(data.info.warningBell);
        // setFinishBell(data.info.finishBell);
      } else if (data.table[index].boxType === 'TIME_BASED') {
        timer1.setDefaultTime({
          defaultTotalTimer: data.table[index].timePerTeam,
          defaultSpeakingTimer: data.table[index].timePerSpeaking,
        });
        timer1.setTimers(
          data.table[index].timePerTeam,
          data.table[index].timePerSpeaking,
        );
        timer1.setIsSpeakingTimer(true);

        timer2.setDefaultTime({
          defaultTotalTimer: data.table[index].timePerTeam,
          defaultSpeakingTimer: data.table[index].timePerSpeaking,
        });
        timer2.setTimers(
          data.table[index].timePerTeam,
          data.table[index].timePerSpeaking,
        );
        timer2.setIsSpeakingTimer(true);
      }
      // setWarningBell(data.info.warningBell);
      // setFinishBell(data.info.finishBell);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    index,
    timer1.setDefaultTime,
    timer1.setTimers,
    timer2.setDefaultTime,
    timer2.setTimers,
  ]);

  // Add keyboard event listener
  useEffect(() => {
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

      // Disable web browsers' default actions
      if (keysToDisable.includes(event.key)) {
        event.preventDefault();
      }

      // Clear focus on the keyboard event
      if (event.target instanceof HTMLElement) {
        event.target.blur();
      }

      switch (event.code) {
        case 'Space':
          if (prosConsSelected === 'pros') {
            if (timer1.isRunning) {
              timer1.pauseTimer();
            } else {
              timer1.startTimer();
            }
          } else if (prosConsSelected === 'cons') {
            if (timer2.isRunning) {
              timer2.pauseTimer();
            } else {
              timer2.startTimer();
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
          if (prosConsSelected === 'pros') {
            timer1.resetTimer();
          } else if (prosConsSelected === 'cons') {
            timer2.resetTimer();
          }
          break;
        case 'KeyA':
          setProsConsSelected('pros');
          if (timer2.isRunning) {
            timer2.pauseTimer();
          }
          break;
        case 'KeyL':
          setProsConsSelected('cons');
          if (timer1.isRunning) {
            timer1.pauseTimer();
          }
          break;
        case 'Enter':
          if (prosConsSelected === 'pros') {
            if (timer1.isRunning) {
              timer1.pauseTimer();
              timer2.startTimer();
              setProsConsSelected('cons');
            } else {
              timer1.pauseTimer();
              setProsConsSelected('cons');
            }
          } else if (prosConsSelected === 'cons') {
            if (timer2.isRunning) {
              timer2.pauseTimer();
              timer1.startTimer();
              setProsConsSelected('pros');
            } else {
              timer2.pauseTimer();
              setProsConsSelected('pros');
            }
          }
      }
    };

    // Set listener when component is rendered
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      // Remove listener when component is rendered
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToOtherItem, prosConsSelected, timer1, timer2]);

  // Calculate whether timer should show additional timer button
  useEffect(() => {
    if (data) {
      data.table.forEach((value) => {
        if (value.speechType === 'TIME_OUT') {
          setIsTimerChangeable(false);
        }
      });
    }
  });

  // Stop timer on 0 sec when additional timer is enabled
  // useEffect(() => {
  //   if (isAdditionalTimerOn && timer === 0 && isRunning) {
  //     pauseTimer();
  //     setTimer(savedTimer);
  //     setIsAdditionalTimerOn(!isAdditionalTimerOn);
  //   }
  // }, [
  //   isAdditionalTimerOn,
  //   timer,
  //   savedTimer,
  //   pauseTimer,
  //   setIsAdditionalTimerOn,
  //   setTimer,
  //   isRunning,
  // ]);
  useEffect(() => {
    if (prosConsSelected === 'cons') {
      timer1.resetTimer();
    } else if (prosConsSelected === 'pros') {
      timer2.resetTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prosConsSelected]);

  useEffect(() => {
    if (timer1.speakingTimer === 0 || timer1.totalTimer === 0) {
      setProsConsSelected((prev) => (prev !== 'cons' ? 'cons' : prev));
      timer1.pauseTimer();
    } else if (timer2.speakingTimer === 0 || timer2.totalTimer === 0) {
      setProsConsSelected((prev) => (prev !== 'pros' ? 'pros' : prev));
      timer2.pauseTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timer1.speakingTimer,
    timer1.totalTimer,
    timer2.speakingTimer,
    timer2.totalTimer,
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
              type={'PARLIAMENTARY'}
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
          <DefaultLayout.Header.Right defaultIcons={['home', 'logout']}>
            <IconButton
              icon={<IoHelpCircle size={24} />}
              onClick={() => {
                setIsFirst(true);
                localStorage.setItem(IS_FIRST, TRUE);
              }}
            />
          </DefaultLayout.Header.Right>
        </DefaultLayout.Header>

        {/* Containers */}
        <DefaultLayout.ContentContainer>
          <div className="relative z-10 flex h-full w-full flex-col items-center justify-center space-y-[40px]">
            {/* Tooltip */}
            {isFirst && (
              <FirstUseToolTip
                onClose={() => {
                  setIsFirst(false);
                  localStorage.setItem(IS_FIRST, FALSE);
                }}
              />
            )}
            {/* 타이머 두 개 + ENTER 버튼 */}
            {data.table[index].boxType === 'PARLIAMENTARY' && (
              <NomalTimer
                isAdditionalTimerOn={isAdditionalTimerOn}
                onStart={() => nomalTimer.startTimer()}
                onPause={() => nomalTimer.pauseTimer()}
                onReset={() => nomalTimer.resetTimer()}
                addOnTimer={(delta: number) =>
                  nomalTimer.setTimer(nomalTimer.timer + delta)
                }
                isRunning={nomalTimer.isRunning}
                timer={nomalTimer.timer}
                isLastItem={
                  data !== undefined && index === data.table.length - 1
                }
                isFirstItem={index === 0}
                goToOtherItem={(isPrev: boolean) => {
                  goToOtherItem(isPrev);
                  nomalTimer.resetTimer();
                }}
                isTimerChangeable={isTimerChangeable}
                onChangingTimer={() => {
                  nomalTimer.pauseTimer();

                  if (!isAdditionalTimerOn) {
                    saveTimer(nomalTimer.timer);
                    nomalTimer.setTimer(0);
                  } else {
                    nomalTimer.setTimer(savedTimer);
                  }

                  setIsAdditionalTimerOn(!isAdditionalTimerOn);
                }}
                item={data.table[index]}
              />
            )}
            {data.table[index].boxType === 'TIME_BASED' && (
              <div className="flex flex-row items-center justify-center space-x-[-30px]">
                {/* 왼쪽 타이머 */}
                <Timer
                  onStart={() => timer1.startTimer()}
                  onPause={() => timer1.pauseTimer()}
                  onReset={() => timer1.resetTimer()}
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
                    timer1.resetTimer();
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
                  prosCons="pros"
                  teamName={data.info.prosTeamName}
                />

                {/* ENTER 버튼 */}
                <button
                  onClick={() => {
                    if (prosConsSelected === 'pros')
                      setProsConsSelected('cons');
                    else setProsConsSelected('pros');
                  }}
                  className="z-20 flex h-[100px] w-[100px] flex-col items-center justify-center rounded-full bg-neutral-600 text-white shadow-lg transition hover:bg-neutral-500"
                >
                  <FaExchangeAlt className="text-[36px]" />
                  <span className="text-[18px] font-bold">ENTER</span>
                </button>

                {/* 오른쪽 타이머 */}
                <Timer
                  onStart={() => timer2.startTimer()}
                  onPause={() => timer2.pauseTimer()}
                  onReset={() => timer2.resetTimer()}
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
                    timer2.resetTimer();
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
              </div>
            )}
            {/* 하단의 이전차례/다음차례 버튼 */}
            <div className="flex flex-row items-center justify-center space-x-[20px]">
              <button
                className="flex flex-row items-center space-x-[20px] rounded-full border border-neutral-300 bg-neutral-200 px-[32px] py-[20px] transition hover:bg-brand-main"
                onClick={() => goToOtherItem(true)}
              >
                <FaArrowLeft className="size-[36px]" />
                <h1 className="text-[28px] font-semibold">이전 차례</h1>
              </button>

              <button
                className="flex flex-row items-center space-x-[20px] rounded-full border border-neutral-300 bg-neutral-200 px-[32px] py-[20px] transition hover:bg-brand-main"
                onClick={() => goToOtherItem(false)}
              >
                <h1 className="text-[28px] font-semibold">다음 차례</h1>
                <FaArrowRight className="size-[36px]" />
              </button>
            </div>
          </div>
          {/* Gradient background */}
          <div
            data-testid="timer-page-background"
            className={`absolute inset-0 z-0 animate-gradient opacity-80 ${bg}`}
          />
        </DefaultLayout.ContentContainer>
      </DefaultLayout>
    </>
  );
}

{
  /* <div className="relative z-10 flex h-full w-full flex-col items-center justify-center space-y-[40px]">
  {isFirst && (
    <FirstUseToolTip
      onClose={() => {
        setIsFirst(false);
        localStorage.setItem(IS_FIRST, FALSE);
      }}
    />
  )}

  <div className="flex flex-row items-center justify-center space-x-[30px]">
    <Timer
      isAdditionalTimerOn={isAdditionalTimerOn}
      onStart={() => timer1.startTimer()}
      onPause={() => timer1.pauseTimer()}
      onReset={() => timer1.resetTimer()}
      addOnTimer={(delta: number) =>
        timer1.setTimers(timer1.totalTimer ?? 0 + delta)
      }
      isRunning={timer1.isRunning}
      timer={timer1.totalTimer ?? 0}
      isLastItem={data !== undefined && index === data.table.length - 1}
      isFirstItem={index === 0}
      goToOtherItem={(isPrev: boolean) => {
        goToOtherItem(isPrev);
        timer1.resetTimer();
      }}
      isTimerChangeable={isTimerChangeable}
      onChangingTimer={() => {
        timer1.pauseTimer();

        // if (!isAdditionalTimerOn) {
        //   saveTimer(totalTimer);
        //   setTimer(0);
        // } else {
        //   setTimer(savedTimer);
        // }

        setIsAdditionalTimerOn(!isAdditionalTimerOn);
      }}
      item={data.table[index]}
      speakingTimer={timer1.speakingTimer}
      isSelected={prosConsSelected === 'pros'}
      onActivate={() => setProsConsSelected('pros')}
    />

    <button
      onClick={() => {
        if (prosConsSelected === 'pros') setProsConsSelected('cons');
        else setProsConsSelected('pros');
      }}
      className="flex h-[100px] w-[100px] flex-col items-center justify-center rounded-full bg-neutral-600 text-white shadow-lg transition hover:bg-neutral-500"
    >
      <FaExchangeAlt className="text-[36px]" />
      <span className="text-[18px] font-bold">ENTER</span>
    </button>

    <Timer
      isAdditionalTimerOn={isAdditionalTimerOn}
      onStart={() => timer2.startTimer()}
      onPause={() => timer2.pauseTimer()}
      onReset={() => timer2.resetTimer()}
      addOnTimer={(delta: number) =>
        timer2.setTimers(timer2.totalTimer ?? 0 + delta)
      }
      isRunning={timer2.isRunning}
      timer={timer2.totalTimer ?? 0}
      isLastItem={data !== undefined && index === data.table.length - 1}
      isFirstItem={index === 0}
      goToOtherItem={(isPrev: boolean) => {
        goToOtherItem(isPrev);
        timer2.resetTimer();
      }}
      isTimerChangeable={isTimerChangeable}
      onChangingTimer={() => {
        timer2.pauseTimer();

        // if (!isAdditionalTimerOn) {
        //   saveTimer(timer);
        //   setTimer(0);
        // } else {
        //   setTimer(savedTimer);
        // }

        setIsAdditionalTimerOn(!isAdditionalTimerOn);
      }}
      item={data.table[index]}
      speakingTimer={timer2.speakingTimer}
      isSelected={prosConsSelected === 'cons'}
      onActivate={() => {
        setProsConsSelected('cons');
      }}
    />
    <div className="flex flex-row items-center justify-center space-x-[20px]">
      <button
        className="flex flex-row items-center space-x-[20px] rounded-full border border-neutral-300 bg-neutral-200 px-[32px] py-[20px] transition hover:bg-brand-main"
        onClick={() => goToOtherItem(true)}
      >
        <FaArrowLeft className="size-[36px]" />
        <h1 className="text-[28px] font-semibold">이전 차례</h1>
      </button>

      <button
        className="flex flex-row items-center space-x-[20px] rounded-full border border-neutral-300 bg-neutral-200 px-[32px] py-[20px] transition hover:bg-brand-main"
        onClick={() => goToOtherItem(false)}
      >
        <h1 className="text-[28px] font-semibold">다음 차례</h1>
        <FaArrowRight className="size-[36px]" />
      </button>
    </div>
  </div>
</div>; */
}
