import { useState } from 'react';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import TimerComponent from './components/TimerComponent';
import { useQuery } from '@tanstack/react-query';
import { getParliamentaryTableData, queryKeyIdentifier } from '../../apis/apis';
import Spinner from '../common/Spinner';
import { RiErrorWarningLine } from 'react-icons/ri';

export default function TimerPage() {
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
  const [bg, setBg] = useState<string>('');
  const updateBg = (bg: string) => {
    setBg(bg);
  };

  // Declare functions that manages array's index
  const increaseIndex = (max: number) => {
    if (index >= max - 1) {
      return;
    }
    setIndex(index + 1);
    // console.log(`# index = ${index}, max = ${max}`);
  };
  const decreaseIndex = () => {
    if (index <= 0) {
      return;
    }
    setIndex(index - 1);
    // console.log(`# index = ${index}`);
  };

  // Handle exceptions
  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center space-y-5">
        <Spinner />
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
          <div className="flex flex-wrap items-center gap-2 px-2 md:w-auto md:gap-3">
            <span className="text-lg md:text-base md:text-xl">토론 주제</span>
            <h1 className="w-full p-2 text-base font-bold md:w-[30rem] md:text-2xl">
              {data === undefined ? '주제 불러오기 실패' : data!.info.agenda}
            </h1>
          </div>
        </DefaultLayout.Header.Right>
      </DefaultLayout.Header>

      <DefaultLayout.ContentContanier>
        <div className="relative z-10 h-full">
          <TimerComponent
            debateInfoList={data!.table}
            index={index}
            increaseIndex={() => increaseIndex(data!.table.length)}
            decreaseIndex={() => decreaseIndex()}
            updateBg={(bg: string) => updateBg(bg)}
          />
        </div>
        <div
          className={`absolute inset-0 top-[80px] z-0 animate-gradient opacity-80 ${bg}`}
        ></div>
      </DefaultLayout.ContentContanier>
    </DefaultLayout>
  );
}
