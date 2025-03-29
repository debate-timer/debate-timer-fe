import RoundControlButton from '../../../components/RoundControlButton/RoundControlButton';
import { ParliamentaryTimeBoxInfo } from '../../../type/type';
import TimeTableItem from './TimeTableItem';

interface TimeTableProps {
  goToOtherItem: (isPrev: boolean) => void;
  currIndex: number;
  items: ParliamentaryTimeBoxInfo[];
  titles?: {
    pros: string;
    cons: string;
  };
}

export default function TimeTable({
  goToOtherItem,
  currIndex,
  items,
  titles,
}: TimeTableProps) {
  return (
    <div className="flex min-w-[740px] flex-col items-center justify-center">
      <div
        data-testid="time-table"
        className="mb-[30px] flex w-full flex-col rounded-[23px] bg-neutral-100 pb-[20px]"
      >
        {/** Print team name (pros/cons or if user wants, custom team name) */}
        <div className="mb-[15px] flex h-[78px] w-full flex-row items-center justify-center rounded-t-[23px] bg-neutral-900 text-[28px] font-bold text-neutral-50">
          <h1 className="w-full text-center">
            {titles !== undefined ? titles.pros : '찬성'}
          </h1>
          <h1 className="text-neutral-500">|</h1>
          <h1 className="w-full text-center">
            {titles !== undefined ? titles.cons : '반대'}
          </h1>
        </div>

        {/** Print time table items(timeboxes) */}
        <div className="flex w-full flex-col space-y-[15px] px-[10px]">
          {items.length > 0 && (
            <div className="flex w-full flex-col space-y-[15px]">
              <div className="h-[70px] w-full">
                {currIndex - 2 >= 0 && (
                  <TimeTableItem
                    isCurrent={false}
                    item={items[currIndex - 2]}
                  />
                )}
              </div>

              <div className="h-[70px] w-full">
                {currIndex - 1 >= 0 && (
                  <TimeTableItem
                    isCurrent={false}
                    item={items[currIndex - 1]}
                  />
                )}
              </div>

              <div className="h-[70px] w-full">
                <TimeTableItem isCurrent={true} item={items[currIndex]} />
              </div>

              <div className="h-[70px] w-full">
                {currIndex + 1 <= items.length - 1 && (
                  <TimeTableItem
                    isCurrent={false}
                    item={items[currIndex + 1]}
                  />
                )}
              </div>

              <div className="h-[70px] w-full">
                {currIndex + 2 <= items.length - 1 && (
                  <TimeTableItem
                    isCurrent={false}
                    item={items[currIndex + 2]}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/** Prev/next buttons */}
      <div className="flex w-max flex-row items-center justify-center space-x-[20px]">
        <RoundControlButton type="PREV" onClick={() => goToOtherItem(true)} />
        <RoundControlButton type="NEXT" onClick={() => goToOtherItem(false)} />
      </div>
    </div>
  );
}
