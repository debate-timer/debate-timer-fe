import { useCallback, useEffect, useRef, useState } from 'react';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import Timer from './components/Timer';
import TimeTable from './components/TimeTable';
import { useTimer } from './hooks/useTimer';
import { useParams } from 'react-router-dom';
import { useGetParliamentaryTableData } from '../../hooks/query/useGetParliamentaryTableData';
import FirstUseToolTip from './components/FirstUseToolTip';

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

  // Prepare state for changing background
  const [bg, setBg] = useState('');

  // Prepare for index-related constants
  const [index, setIndex] = useState(0);
  const goToOtherItem = useCallback(
    (isPrev: boolean) => {
      if (isPrev) {
        if (index > 0) {
          setIndex((prev) => prev - 1);
        }
      } else {
        if (index < 10) {
          setIndex((prev) => prev + 1);
        }
      }
    },
    [index],
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
          break;
        case 'ArrowRight':
          goToOtherItem(false);
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

  return (
    <>
      <audio ref={warningBellRef} src="/sounds/bell-warning.mp3" />
      <audio ref={finishBellRef} src="/sounds/bell-finish.mp3" />

      <DefaultLayout>
        {/* Headers */}
        <DefaultLayout.Header>
          <DefaultLayout.Header.Left>
            <h1>Left of header</h1>
          </DefaultLayout.Header.Left>
          <DefaultLayout.Header.Center>
            <h1>Center of header</h1>
          </DefaultLayout.Header.Center>
          <DefaultLayout.Header.Right>
            <h1>Right of header</h1>
          </DefaultLayout.Header.Right>
        </DefaultLayout.Header>

        {/* Containers */}
        <DefaultLayout.ContentContanier>
          <div className="relative z-10 h-full w-full">
            {isFirst && (
              <FirstUseToolTip
                onClose={() => {
                  setIsFirst(false);
                  localStorage.setItem(IS_FIRST, FALSE);
                }}
              />
            )}

            <div className="absolute inset-0 flex h-full w-full flex-row items-center justify-center space-x-[50px]">
              <Timer
                onStart={() => startTimer()}
                onPause={() => pauseTimer()}
                onReset={() => resetTimer()}
                isRunning={isRunning}
                timer={timer}
                goToOtherItem={(isPrev: boolean) => goToOtherItem(isPrev)}
                isTimerChangeable={false}
                onChangeTimer={() => {}}
                item={data!.table[index]}
              />
              <TimeTable currIndex={index} items={data!.table} />
            </div>
          </div>

          <div
            className={`absolute inset-0 z-0 animate-gradient opacity-80 ${bg}`}
          />
        </DefaultLayout.ContentContanier>
      </DefaultLayout>
    </>
  );
}
