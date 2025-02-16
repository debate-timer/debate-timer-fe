import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import useLogout from '../../hooks/mutations/useLogout';
import HeaderButtons from './components/common/HeaderButtons';
import { useGetParliamentaryTableData } from '../../hooks/query/useGetParliamentaryTableData';
import TimerLoadingPage from './TimerLoadingPage';
import { useModal } from '../../hooks/useModal';
import { useTimer } from './hooks/useTimer';
import TimerComponent from './components/Timer/TimerComponent';
import TimerTimeTable from './components/Timer/TimerTimeTable';
import FirstUseToolTip from './components/common/FirstUseToolTip';
import useMobile from '../../hooks/useMobile';
import AdditionalTimerComponent from './components/AdditionalTimer/AdditionalTimerComponent';

export default function TimerPage() {
  // Load sounds
  const dingOnceRef = useRef<HTMLAudioElement>(null);
  const dingTwiceRef = useRef<HTMLAudioElement>(null);

  // Prepare parameter
  const pathParams = useParams();
  const tableId = pathParams.id;

  // Use timer hook
  const {
    timer,
    setTimer,
    pauseTimer,
    startTimer,
    isRunning,
    resetTimer,
    setDefaultValue,
  } = useTimer();

  // Get query
  const { data, isLoading } = useGetParliamentaryTableData(Number(tableId));

  // Set states
  const [isFirst, setIsFirst] = useState(false);
  const [index, setIndex] = useState(0);
  const [bg, setBg] = useState('');
  const [isWarningBellOn, setWarningBell] = useState(false);
  const [isFinishBellOn, setFinishBell] = useState(false);

  // Prepare other hooks
  const isMobile = useMobile();
  const navigate = useNavigate();
  const { isOpen, openModal, ModalWrapper } = useModal();
  const { mutate: logoutMutate } = useLogout(() => navigate('/login'));

  // Declare functions
  const moveToOtherItem = useCallback(
    (goToPrev: boolean) => {
      if (goToPrev) {
        if (index > 0) {
          setIndex((prev) => prev - 1);
        }
      } else {
        if (data && index < data.table.length - 1) {
          setIndex((prev) => prev + 1);
        }
      }
      resetTimer();
    },
    [data, index, resetTimer],
  );

  // Open tooltip when value of 'isFirst' is true
  useEffect(() => {
    const storedIsFirst = localStorage.getItem('isFirst');

    if (storedIsFirst === null) {
      setIsFirst(true);
    } else {
      setIsFirst(storedIsFirst.trim() === 'true' ? true : false);
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
    if (dingOnceRef.current && isRunning && isWarningBellOn && timer === 30) {
      dingOnceRef.current.play();
    }

    if (dingTwiceRef.current && isRunning && isFinishBellOn && timer === 0) {
      dingTwiceRef.current.play();
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

      if (isOpen) {
        return;
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
          moveToOtherItem(true);
          break;
        case 'ArrowRight':
          moveToOtherItem(false);
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
  }, [isOpen, isRunning, resetTimer, startTimer, moveToOtherItem, pauseTimer]);

  // Print loading page
  if (isLoading) {
    return <TimerLoadingPage />;
  }

  // Return TimerPage
  return (
    <>
      <audio ref={dingOnceRef} src="/sounds/ding-once-edit.mp3" />
      <audio ref={dingTwiceRef} src="/sounds/ding-twice-edit.mp3" />

      <DefaultLayout>
        {/* Headers */}
        <DefaultLayout.Header>
          <DefaultLayout.Header.Left>
            <div className="flex flex-wrap items-center text-2xl font-bold md:text-3xl">
              <h1 className="mr-2">
                {data === undefined || data!.info.name.trim() === ''
                  ? '테이블 이름 없음'
                  : data!.info.name}
              </h1>
              <div className="mx-3 h-6 w-[2px] bg-black"></div>
              <span className="text-lg font-normal md:text-xl">의회식</span>
            </div>
          </DefaultLayout.Header.Left>
          <DefaultLayout.Header.Center>
            <div className="my-2 flex flex-col items-center">
              <h1 className="text-m md:text-lg">토론 주제</h1>
              <h1 className="text-xl font-bold md:text-2xl">
                {data === undefined || data!.info.agenda.trim() === ''
                  ? '주제 없음'
                  : data!.info.agenda}
              </h1>
            </div>
          </DefaultLayout.Header.Center>
          <DefaultLayout.Header.Right>
            <HeaderButtons
              onClickHome={() => navigate('/')}
              onClickHelp={() => {
                setIsFirst(true);
                localStorage.setItem('isFirst', 'true');
              }}
              onClickLogout={() => logoutMutate()}
            />
          </DefaultLayout.Header.Right>
        </DefaultLayout.Header>

        {/* Containers */}
        <DefaultLayout.ContentContanier>
          {!isOpen && (
            <div className="relative z-10 h-full">
              {/* Tooltip */}
              {isFirst && (
                <FirstUseToolTip
                  onClose={() => {
                    setIsFirst(false);
                    localStorage.setItem('isFirst', 'false');
                  }}
                />
              )}

              {/* Timer and timetable */}
              <div
                className={`absolute inset-0 ${isMobile ? 'top-[50px]' : ''} flex h-full ${isMobile ? 'flex-col' : 'flex-row'} items-center justify-center ${isMobile ? 'space-y-20' : 'space-x-20'}`}
              >
                <TimerComponent
                  isRunning={isRunning}
                  debateInfo={data!.table[index]}
                  timer={timer}
                  onOpenModal={() => openModal()}
                  startTimer={() => {
                    startTimer();
                  }}
                  pauseTimer={() => {
                    pauseTimer();
                  }}
                  resetTimer={() => {
                    resetTimer(data!.table[index].time);
                  }}
                  isWarningBellOn={isWarningBellOn}
                  isFinishBellOn={isFinishBellOn}
                  onChangeWarningBell={() => setWarningBell(!isWarningBellOn)}
                  onChangeFinishBell={() => setFinishBell(!isFinishBellOn)}
                />

                <TimerTimeTable
                  currIndex={index}
                  tables={data!.table}
                  moveToOtherItem={(goToPrev: boolean) =>
                    moveToOtherItem(goToPrev)
                  }
                />
              </div>
            </div>
          )}

          <div
            className={`absolute inset-0 z-0 animate-gradient opacity-80 ${bg}`}
          ></div>
        </DefaultLayout.ContentContanier>
      </DefaultLayout>

      <ModalWrapper>
        <AdditionalTimerComponent />
      </ModalWrapper>
    </>
  );
}
