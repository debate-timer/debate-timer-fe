import { useState, useRef, useEffect, useCallback } from 'react';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import TimerComponent from './components/TimerComponent';
import DebateInfoSummary from './components/DebateInfoSummary';
import { useParams, useSearchParams } from 'react-router-dom';
import TimerLoadingPage from './TimerLoadingPage';
import { useGetParliamentaryTableData } from '../../hooks/query/useGetParliamentaryTableData';

export default function TimerPage() {
  // Load sounds
  const dingOnceRef = useRef<HTMLAudioElement>(null);
  const dingTwiceRef = useRef<HTMLAudioElement>(null);

  // Prepare data before requesting query
  const [searchParams] = useSearchParams();
  const pathParams = useParams();
  const memberId = searchParams.get('memberId');
  const tableId = pathParams.id;

  // Validate parameters is prepared
  if (memberId === null && tableId === undefined) {
    throw new Error(
      "Failed to resolve 'memberId' and 'tableId' from request URL",
    );
  } else if (tableId === undefined) {
    throw new Error("Failed to resolve 'tableId' from request URL");
  } else if (memberId === null) {
    throw new Error("Failed to resolve 'memberId' from request URL");
  }

  // Get query
  const { data, isLoading } = useGetParliamentaryTableData(
    Number(tableId),
    Number(memberId),
  );
  console.log(`# memberId: ${memberId}, tableId: ${tableId}`);

  // Declare states
  const [index, setIndex] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [bg, setBg] = useState<string>('');

  // Declare functions to handle timer
  const startTimer = useCallback(() => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
  }, []);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (data) setTimer(data.table[index].time);
  }, [data, index]);

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

  const changeBg = (condition: NodeJS.Timeout | null, timer: number) => {
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
    changeBg(intervalRef.current, timer);
  }, [timer]);

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Clear focus on the keyboard event
      if (event.target instanceof HTMLElement) {
        event.target.blur();
      }

      switch (event.code) {
        case 'Space':
          if (intervalRef.current) {
            // console.log('# timer paused');
            pauseTimer();
            changeBg(intervalRef.current, timer);
          } else {
            // console.log('# timer started');
            startTimer();
            changeBg(intervalRef.current, timer);
          }
          break;
        case 'ArrowLeft':
          moveToOtherItem(true);
          changeBg(intervalRef.current, timer);
          break;
        case 'ArrowRight':
          moveToOtherItem(false);
          changeBg(intervalRef.current, timer);
          break;
        case 'KeyR':
          resetTimer();
          changeBg(intervalRef.current, timer);
          break;
      }
    };

    // Set listener when component is rendered
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      // Remove listener when component is rendered
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pauseTimer, startTimer, timer, moveToOtherItem, resetTimer]);

  // Let timer play sounds when only 30 seconds left or timeout
  useEffect(() => {
    if (dingOnceRef.current && timer === 30) {
      dingOnceRef.current.play();
    } else if (dingTwiceRef.current && timer === 0) {
      dingTwiceRef.current.play();
    }
  }, [timer]);

  // Let timer initialize itself when data is loaded via api
  useEffect(() => {
    if (data) {
      setTimer(data.table[index].time);
    }
  }, [data, index, resetTimer]);

  // Handle exceptions
  if (isLoading) {
    return <TimerLoadingPage />;
  }

  // console.log(`# index = ${index}, data = ` + data!.table[index].time);
  // console.log(`# isRunning = ${isRunning}`);

  // Return React component
  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>
          <div className="flex flex-wrap items-center px-2 text-2xl font-bold md:text-3xl">
            <h1 className="mr-2">
              {data === undefined
                ? '테이블 이름 불러오기 실패'
                : data!.info.name}
            </h1>
            <div className="mx-3 h-6 w-[2px] bg-black"></div>
            <span className="text-lg font-normal md:text-xl">의회식</span>
          </div>
        </DefaultLayout.Header.Left>
        <DefaultLayout.Header.Right>
          <div className="flex flex-row items-center space-x-3 md:w-auto md:gap-3">
            <h1 className="text-lg md:text-xl">토론 주제</h1>
            <h1 className="text-xl font-bold md:w-auto md:text-2xl">
              {data === undefined ? '주제 불러오기 실패' : data!.info.agenda}
            </h1>
          </div>
        </DefaultLayout.Header.Right>
      </DefaultLayout.Header>

      <DefaultLayout.ContentContanier>
        <audio ref={dingOnceRef} src="/sounds/ding-once-edit.mp3" />
        <audio ref={dingTwiceRef} src="/sounds/ding-twice-edit.mp3" />

        <div className="relative z-10 h-full">
          <div className="flex h-full flex-row items-center space-x-4">
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
              debateInfo={data!.table[index]}
              timer={timer}
              startTimer={() => {
                startTimer();
                changeBg(intervalRef.current, timer);
              }}
              pauseTimer={() => {
                pauseTimer();
                changeBg(intervalRef.current, timer);
              }}
              resetTimer={() => {
                resetTimer();
                changeBg(intervalRef.current, timer);
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

        <div
          className={`absolute inset-0 top-[80px] z-0 animate-gradient opacity-80 ${bg}`}
        ></div>
      </DefaultLayout.ContentContanier>
    </DefaultLayout>
  );
}
