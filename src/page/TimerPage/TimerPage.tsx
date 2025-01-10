import { useState } from 'react';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import DebateInfoSummary from './components/DebateInfoSummary';
import TimerComponent from './components/TimerComponent';
import { useQuery } from '@tanstack/react-query';
import { getParliamentaryTableData, queryKeyIdentifier } from '../../apis/apis';

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

  // Declare functions that manages array's index
  const increaseIndex = (max: number) => {
    // console.log(`# index = ${index}`);
    if (index >= max) {
      return;
    }
    setIndex(index + 1);
  };
  const decreaseIndex = () => {
    // console.log(`# index = ${index}`);
    if (index <= 0) {
      return;
    }
    setIndex(index - 1);
  };

  // Handle exceptions
  if (isLoading) {
    return <div>Loading</div>;
  }
  if (isError || data === null) {
    return <div>Error</div>;
  }

  // Return React component
  return (
    <div className="relative h-full w-full">
      {/* Let animated background be located behind of the timer */}
      <div
        className={`absolute inset-0 h-full w-full animate-gradient opacity-80 ${bg}`}
      />

      <DefaultLayout>
        {/* Header */}
        <DefaultLayout.Header>
          <DefaultLayout.Header.Left>왼쪽</DefaultLayout.Header.Left>
          <DefaultLayout.Header.Center>가운데</DefaultLayout.Header.Center>
          <DefaultLayout.Header.Right>오른쪽</DefaultLayout.Header.Right>
        </DefaultLayout.Header>

        {/* Content */}
        <DefaultLayout.ContentContanier>
          <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
            <TimerComponent
              debateInfo={data!.table[index]}
              increaseIndex={increaseIndex}
              decreaseIndex={decreaseIndex}
              setBg={setBg}
            />
          </div>
        </DefaultLayout.ContentContanier>

        {/* Footer */}
        <DefaultLayout.StickyFooterWrapper>
          <div className="flex w-full flex-row justify-between">
            <div className="flex">
              {index !== 0 && (
                <DebateInfoSummary
                  isPrev={true}
                  debateInfo={data!.table[index - 1]}
                />
              )}
            </div>
            <div className="flex">
              {index !== data!.table.length - 1 && (
                <DebateInfoSummary
                  isPrev={false}
                  debateInfo={data!.table[index + 1]}
                />
              )}
            </div>
          </div>
        </DefaultLayout.StickyFooterWrapper>
      </DefaultLayout>
    </div>
  );
}
