import { useState, useRef, useEffect, useCallback } from 'react';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import TimerComponent from './components/TimerComponent';
import { useQuery } from '@tanstack/react-query';
import { getParliamentaryTableData, queryKeyIdentifier } from '../../apis/apis';
import { RiErrorWarningLine } from 'react-icons/ri';
import DebateInfoSummary from './components/DebateInfoSummary';

export default function TimerPage() {
  // Load sounds
  const dingOnceRef = useRef<HTMLAudioElement>(null);
  const dingTwiceRef = useRef<HTMLAudioElement>(null);

  // Prepare data before requesting query
  const tableId = 1024;
  const memberId = 1024;
  const queryKey = [
    queryKeyIdentifier.getParliamentaryTableData,
    tableId,
    memberId,
  ];

  // Get query
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKey,
    queryFn: () => getParliamentaryTableData(tableId, memberId),
  });

  // Declare states
  const [index, setIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [bg, setBg] = useState<string>('');

  // Declare functions to handle timer
  const startTimer = useCallback(() => {
    if (!intervalRef.current) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 10);
      }, 10);
    }
  }, []);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    if (data) setTimer(data.table[index].time * 1000);
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

  // Set parent component's background animation by timer's state and remaining time
  useEffect(() => {
    if (!isRunning) {
      setBg('');
    } else if (timer > 30 * 1000) {
      setBg('gradient-timer-running');
    } else if (timer >= 0) {
      setBg('gradient-timer-warning');
    } else {
      setBg('gradient-timer-timeout');
    }
  }, [timer, isRunning]);

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
            // console.log('# timer paused');
            pauseTimer();
          } else {
            // console.log('# timer started');
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
  }, [pauseTimer, startTimer, moveToOtherItem, isRunning, resetTimer]);

  // Let timer play sounds when only 30 seconds left or timeout
  useEffect(() => {
    if (dingOnceRef.current && timer === 30 * 1000) {
      dingOnceRef.current.play();
    } else if (dingTwiceRef.current && timer === 0) {
      dingTwiceRef.current.play();
    }
  }, [timer]);

  // Let timer initialize itself when data is loaded via api
  useEffect(() => {
    if (data) {
      setTimer(data.table[index].time * 1000);
    }
  }, [data, index, resetTimer]);

  /*
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);
  */

  // Handle exceptions
  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center space-y-5">
        <img src="/spinner.gif" className="size-[120px]" alt="불러오는 중" />
        <h1 className="text-xl font-bold">데이터를 불러오고 있습니다...</h1>
      </div>
    );
  }

  if (isError || data === null) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center space-y-5">
        <RiErrorWarningLine className="size-[120px]" />
        <h1 className="text-xl font-bold">
          데이터를 불러오는 중 오류가 발생했어요.
        </h1>
      </div>
    );
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
              }}
              pauseTimer={() => {
                pauseTimer();
              }}
              resetTimer={() => {
                resetTimer();
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
