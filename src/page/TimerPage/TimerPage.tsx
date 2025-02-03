import { useState, useRef, useEffect, useCallback } from 'react';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import TimerComponent from './components/Timer/TimerComponent';
import DebateInfoSummary from './components/DebateInfoSummary';
import { useNavigate, useParams } from 'react-router-dom';
import TimerLoadingPage from './TimerLoadingPage';
import { useGetParliamentaryTableData } from '../../hooks/query/useGetParliamentaryTableData';
import { useModal } from '../../hooks/useModal';
import AdditionalTimerComponent from './components/AdditionalTimer/AdditionalTimerComponent';
import { IoMdHome } from 'react-icons/io';
import useLogout from '../../hooks/mutations/useLogout';
import { useTimer } from './hooks/useTimer';
import FirstUseToolTip from './components/common/FirstUseToolTip';
import useMobile from '../../hooks/useMobile';
import { IoHelpCircle } from 'react-icons/io5';

export default function TimerPage() {
  // Load sounds
  const dingOnceRef = useRef<HTMLAudioElement>(null);
  const dingTwiceRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();

  // Prepare data before requesting query
  const pathParams = useParams();
  const tableId = pathParams.id;

  // Validate parameters is prepared
  if (tableId === undefined) {
    throw new Error("Failed to resolve 'tableId' from request URL");
  }

  // Prepare for modal
  const { isOpen, openModal, ModalWrapper } = useModal();

  // Get query
  const { data, isLoading } = useGetParliamentaryTableData(Number(tableId));
  const { mutate: logoutMutate } = useLogout(() => navigate('/login'));

  // Use timer hook
  const {
    timer,
    setTimer,
    pauseTimer,
    startTimer,
    isRunning,
    actOnTime,
    resetTimer,
    setDefaultValue,
  } = useTimer();

  // Declare states
  const [index, setIndex] = useState(0);
  const [isFirst, setIsFirst] = useState(false);
  const [bg, setBg] = useState('');
  const isMobile = useMobile();

  // Declare function to manage parent component's index
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

  const changeBg = (condition: boolean, timer: number) => {
    if (condition) {
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
  };

  // Set parent component's background animation by timer's state and remaining time
  useEffect(() => {
    changeBg(isRunning, timer);
  }, [timer, isRunning]);

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
            // console.log('# timer paused');
            pauseTimer();
            changeBg(isRunning, timer);
          } else {
            // console.log('# timer started');
            startTimer();
            changeBg(isRunning, timer);
          }
          break;
        case 'ArrowLeft':
          moveToOtherItem(true);
          changeBg(isRunning, timer);
          break;
        case 'ArrowRight':
          moveToOtherItem(false);
          changeBg(isRunning, timer);
          break;
        case 'KeyR':
          resetTimer();
          changeBg(isRunning, timer);
          break;
      }
    };

    // Set listener when component is rendered
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      // Remove listener when component is rendered
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isRunning,
    isOpen,
    moveToOtherItem,
    pauseTimer,
    resetTimer,
    startTimer,
    timer,
  ]);

  // Let timer play sounds when o nly 30 seconds left or timeout
  useEffect(() => {
    actOnTime(30, () => {
      if (dingOnceRef.current && isRunning) {
        dingOnceRef.current.play();
      }
    });

    actOnTime(0, () => {
      if (dingTwiceRef.current && isRunning) {
        dingTwiceRef.current.play();
      }
    });
  }, [actOnTime, isRunning]);

  // Let timer initialize itself when data is loaded via api
  useEffect(() => {
    if (data) {
      setDefaultValue(data.table[index].time);
      setTimer(data.table[index].time);
    }
  }, [data, index, setDefaultValue, setTimer]);

  useEffect(() => {
    const storedIsFirst = localStorage.getItem('isFirst');
    if (storedIsFirst) {
      setIsFirst(storedIsFirst.trim() === 'true' ? true : false);
    }
  }, []);

  // Handle exceptions
  if (isLoading) {
    return <TimerLoadingPage />;
  }

  // console.log(`# index = ${index}, data = ` + data!.table[index].time);
  // console.log(`# isRunning = ${isRunning}`);

  // Return React component
  return (
    <>
      <audio ref={dingOnceRef} src="/sounds/ding-once-edit.mp3" />
      <audio ref={dingTwiceRef} src="/sounds/ding-twice-edit.mp3" />

      <DefaultLayout>
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
            <div className="flex flex-row justify-end space-x-2">
              <button
                onClick={() => {
                  navigate('/');
                }}
                className="rounded-full bg-slate-300 px-2 py-1 font-bold text-zinc-900 hover:bg-zinc-400"
              >
                <div className="flex flex-row items-center space-x-4">
                  <IoMdHome size={24} />
                  {!isMobile && <h1>홈 화면</h1>}
                </div>
              </button>

              <button
                onClick={() => {
                  setIsFirst(true);
                  localStorage.setItem('isFirst', 'true');
                }}
                className="rounded-full bg-slate-300 px-2 py-1 font-bold text-zinc-900 hover:bg-zinc-400"
              >
                <div className="flex flex-row items-center space-x-4">
                  <IoHelpCircle size={24} />
                  {!isMobile && <h1>도움말</h1>}
                </div>
              </button>
              <button
              onClick={() => logoutMutate()}
              className="rounded-full bg-slate-300 px-2 py-1 font-bold text-zinc-900 hover:bg-zinc-400"
            >
              <div className="flex flex-row items-center space-x-4">
                <h2>로그아웃</h2>
              </div>
            </button>
            </div>
          </DefaultLayout.Header.Right>
        </DefaultLayout.Header>

        <DefaultLayout.ContentContanier>
          {!isOpen && (
            <div className="relative z-10 h-full">
              {isFirst && (
                <FirstUseToolTip
                  onClose={() => {
                    setIsFirst(false);
                    localStorage.setItem('isFirst', 'false');
                  }}
                />
              )}

              <div className="z-2 absolute inset-0 flex h-full flex-row items-center justify-center space-x-4">
                <div className="flex-1">
                  {index !== 0 && (
                    <DebateInfoSummary
                      isPrev={true}
                      moveToOtherItem={(isPrev: boolean) => {
                        moveToOtherItem(isPrev);
                      }}
                      debateInfo={data!.table[index - 1]}
                    />
                  )}
                  {index === 0 && <div className="m-8 w-[240px]"></div>}
                </div>

                <TimerComponent
                  isRunning={isRunning}
                  debateInfo={data!.table[index]}
                  timer={timer}
                  onOpenModal={() => openModal()}
                  startTimer={() => {
                    startTimer();
                    changeBg(isRunning, timer);
                  }}
                  pauseTimer={() => {
                    pauseTimer();
                    changeBg(isRunning, timer);
                  }}
                  resetTimer={() => {
                    resetTimer(data!.table[index].time);
                    changeBg(isRunning, timer);
                  }}
                />

                <div className="flex-1">
                  {index !== data!.table.length - 1 && (
                    <DebateInfoSummary
                      isPrev={false}
                      moveToOtherItem={(isPrev: boolean) => {
                        moveToOtherItem(isPrev);
                      }}
                      debateInfo={data!.table[index + 1]}
                    />
                  )}
                  {index === data!.table.length - 1 && (
                    <div className="m-8 w-[240px]"></div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div
            className={`absolute inset-0 top-[80px] z-0 animate-gradient opacity-80 ${bg}`}
          ></div>
        </DefaultLayout.ContentContanier>
      </DefaultLayout>

      <ModalWrapper>
        <AdditionalTimerComponent
          prevItem={
            data !== null && index > 0 ? data!.table[index - 1] : undefined
          }
          currItem={data!.table[index]}
          nextItem={
            data !== null && index < data!.table.length - 1
              ? data!.table[index + 1]
              : undefined
          }
        />
      </ModalWrapper>
    </>
  );
}
