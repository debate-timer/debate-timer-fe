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
  const [timer, setTimer] = useState<number>(data ? data.table[index].time : 1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [bg, setBg] = useState<string>('');

  // Function that changes background
  const updateBg = useCallback((bg: string) => {
    setBg(bg);
  }, []);

  // Declare functions to handle timer
  const startTimer = useCallback(() => {
    console.log('# start timer');

    if (intervalRef.current === null) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      updateBg(
        timer > 30
          ? 'gradient-timer-running'
          : timer < 0
            ? 'gradient-timer-timeout'
            : 'gradient-timer-warning',
      );
    }
  }, [timer, updateBg]);

  const pauseTimer = useCallback(() => {
    console.log('# pause timer');

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      updateBg('');
    }
  }, [updateBg]);

  const resetTimer = useCallback(() => {
    console.log('# reset timer');

    if (data) setTimer(data.table[index].time);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      updateBg('');
    }
  }, [data, index, updateBg]);

  // Declare function to manage parent component's index
  const moveToOtherItem = useCallback(
    (goToPrev: boolean) => {
      resetTimer();

      if (goToPrev) {
        if (index > 0) {
          setIndex((prev) => prev - 1);
        }
      } else {
        if (data && index < data.table.length - 1) {
          setIndex((prev) => prev + 1);
        }
      }
    },
    [resetTimer, data, index],
  );

  // Set parent component's background animation by timer's state and remaining time
  useEffect(() => {
    if (intervalRef.current === null) {
      updateBg('');
    } else if (timer > 30) {
      updateBg('gradient-timer-running');
    } else if (timer > 0) {
      updateBg('gradient-timer-warning');
    } else {
      updateBg('gradient-timer-timeout');
    }
  }, [timer, updateBg]);

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'Space':
          if (intervalRef.current !== null) {
            console.log('# timer paused');
            pauseTimer();
          } else {
            console.log('# timer started');
            startTimer();
          }
          break;
        case 'ArrowLeft':
          moveToOtherItem(true);
          break;
        case 'ArrowRight':
          moveToOtherItem(false);
          break;
      }
    };

    // Set listener when component is rendered
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      // Remove listener when component is rendered
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pauseTimer, startTimer, moveToOtherItem]);

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
    if (data) setTimer(data.table[index].time);
  }, [data, index]);

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
  console.log(`# isRunning = ${intervalRef.current === null}`);

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
