import { useCallback, useEffect, useRef, useState } from 'react';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import Timer from './components/Timer';
import TimeTable from './components/TimeTable';
import { useTimer } from './hooks/useTimer';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetParliamentaryTableData } from '../../hooks/query/useGetParliamentaryTableData';
import FirstUseToolTip from './components/FirstUseToolTip';
import HeaderButtons from './components/HeaderButtons';
import useLogout from '../../hooks/mutations/useLogout';

export default function TimerPage() {
  // ######################################
  // ########## DECLARATION AREA ##########
  // ######################################

  // Load sounds and prepare for bell-related constants
  const warningBellRef = useRef<HTMLAudioElement>(null);
  const finishBellRef = useRef<HTMLAudioElement>(null);
  const [isWarningBellOn, setWarningBell] = useState(false);
  const [isFinishBellOn, setFinishBell] = useState(false);

  // Parse params
  const pathParams = useParams();
  const tableId = pathParams.id;

  // Get query
  const { data } = useGetParliamentaryTableData(Number(tableId));

  // Prepare for tooltip-related constants
  const [isFirst, setIsFirst] = useState(false);
  const IS_FIRST = 'isFirst';
  const TRUE = 'true';
  const FALSE = 'false';

  // Prepare for changing background
  const [bg, setBg] = useState('');

  // Prepare for logout and navigation
  const navigate = useNavigate();
  const { mutate: logoutMutate } = useLogout(() => navigate('/login'));

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
        if (data !== undefined && index < data.table.length - 1) {
          setIndex((prev) => prev + 1);
        }
      }
    },
    [index, data],
  );

  // Prepare for timer hook
  const {
    timer,
    setTimer,
    pauseTimer,
    startTimer,
    isRunning,
    resetTimer,
    setDefaultValue,
  } = useTimer();

  // ######################################
  // ########### useEffect AREA ###########
  // ######################################

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
    if (isRunning) {
      if (timer > 30) {
        setBg('gradient-timer-running');
      } else if (timer >= 0 && timer <= 30) {
        setBg('gradient-timer-warning');
      } else {
        setBg('gradient-timer-timeout');
      }
    } else {
      setBg('');
    }
  }, [isRunning, timer]);

  // Play bells
  useEffect(() => {
    if (
      warningBellRef.current &&
      isRunning &&
      isWarningBellOn &&
      timer === 30
    ) {
      warningBellRef.current.play();
    }

    if (finishBellRef.current && isRunning && isFinishBellOn && timer === 0) {
      finishBellRef.current.play();
    }
  }, [timer, isFinishBellOn, isWarningBellOn, isRunning]);

  // Initiate timer
  useEffect(() => {
    if (data) {
      setDefaultValue(data.table[index].time);
      setTimer(data.table[index].time);
      setWarningBell(data.info.warningBell);
      setFinishBell(data.info.finishBell);
    }
  }, [data, index, setDefaultValue, setTimer]);

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keysToDisable = ['Space', 'ArrowLeft', 'ArrowRight', 'KeyR'];

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
          if (isRunning) {
            pauseTimer();
          } else {
            startTimer();
          }
          break;
        case 'ArrowLeft':
          goToOtherItem(true);
          resetTimer();
          break;
        case 'ArrowRight':
          goToOtherItem(false);
          resetTimer();
          break;
        case 'KeyR':
          resetTimer();
          break;
      }
    };

    // Set listener when component is rendered
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      // Remove listener when component is rendered
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRunning, resetTimer, startTimer, goToOtherItem, pauseTimer]);

  // Calculate whether timer should show additional timer button
  useEffect(() => {
    if (data !== undefined) {
      data.table.forEach((value) => {
        if (value.type === 'TIME_OUT') {
          setIsTimerChangeable(false);
        }
      });
    }
  });

  // Stop timer on 0 sec when additional timer is enabled
  useEffect(() => {
    if (isAdditionalTimerOn && timer === 0 && isRunning) {
      pauseTimer();
      setTimer(savedTimer);
      setIsAdditionalTimerOn(!isAdditionalTimerOn);
    }
  }, [
    isAdditionalTimerOn,
    timer,
    savedTimer,
    pauseTimer,
    setIsAdditionalTimerOn,
    setTimer,
    isRunning,
  ]);

  // ######################################
  // ########### COMPONENT AREA ###########
  // ######################################
  return (
    <>
      <audio ref={warningBellRef} src="/sounds/bell-warning.mp3" />
      <audio ref={finishBellRef} src="/sounds/bell-finish.mp3" />

      <DefaultLayout>
        {/* Headers */}
        <DefaultLayout.Header>
          <DefaultLayout.Header.Left>
            <div className="flex flex-col space-y-[4px]">
              <h1 className="text-sm">의회식</h1>
              <h1 className="text-2xl font-bold">
                {data === undefined || data.info.name.trim() === ''
                  ? '테이블 이름 없음'
                  : data.info.name}
              </h1>
            </div>
          </DefaultLayout.Header.Left>
          <DefaultLayout.Header.Center>
            <h1 className="text-3xl font-bold">
              {data === undefined || data.info.agenda.trim() === ''
                ? '주제 없음'
                : data.info.agenda}
            </h1>
          </DefaultLayout.Header.Center>
          <DefaultLayout.Header.Right>
            <HeaderButtons
              onClickHome={() => navigate('/')}
              onClickHelp={() => {
                setIsFirst(true);
                localStorage.setItem(IS_FIRST, TRUE);
              }}
              onClickLogout={() => logoutMutate()}
            />
          </DefaultLayout.Header.Right>
        </DefaultLayout.Header>

        {/* Containers */}
        <DefaultLayout.ContentContanier>
          <div className="relative z-10 h-full w-full">
            {/* Tooltip */}
            {isFirst && (
              <FirstUseToolTip
                onClose={() => {
                  setIsFirst(false);
                  localStorage.setItem(IS_FIRST, FALSE);
                }}
              />
            )}

            {/* Timer body */}
            <div
              data-testid="timer-page-body"
              className="absolute inset-0 flex h-full w-full flex-row items-center justify-center space-x-[50px]"
            >
              {/* Timer on the left side */}
              <Timer
                isAdditionalTimerOn={isAdditionalTimerOn}
                onStart={() => startTimer()}
                onPause={() => pauseTimer()}
                onReset={() => resetTimer()}
                addOnTimer={(delta: number) => setTimer(timer + delta)}
                isRunning={isRunning}
                timer={timer}
                isLastItem={
                  data !== undefined && index === data.table.length - 1
                }
                isFirstItem={index === 0}
                goToOtherItem={(isPrev: boolean) => {
                  goToOtherItem(isPrev);
                  resetTimer();
                }}
                isTimerChangeable={isTimerChangeable}
                onChangingTimer={() => {
                  pauseTimer();

                  if (!isAdditionalTimerOn) {
                    saveTimer(timer);
                    setTimer(0);
                  } else {
                    setTimer(savedTimer);
                  }

                  setIsAdditionalTimerOn(!isAdditionalTimerOn);
                }}
                item={
                  data !== undefined
                    ? data.table[index]
                    : {
                        stance: 'NEUTRAL',
                        type: 'TIME_OUT',
                        time: 0,
                      }
                }
              />

              {/* Time table on the right side */}
              <TimeTable
                currIndex={index}
                items={data !== undefined ? data.table : []}
              />
            </div>
          </div>

          {/* Gradient background */}
          <div
            data-testid="timer-page-background"
            className={`absolute inset-0 z-0 animate-gradient opacity-80 ${bg}`}
          />
        </DefaultLayout.ContentContanier>
      </DefaultLayout>
    </>
  );
}
