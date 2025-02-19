import { IoArrowDown, IoArrowUp } from 'react-icons/io5';
import { TimeBoxInfo } from '../../../type/type';
import TimeTableItem from './TimeTableItem';

interface TimeTableProps {
  currIndex: number;
  items: TimeBoxInfo[];
  titles?: {
    pros: string;
    cons: string;
  };
}

export default function TimeTable({
  currIndex,
  items,
  titles,
}: TimeTableProps) {
  return (
    <div className="flex w-[811px] flex-col items-center justify-center">
      <div
        data-testid="time-table"
        className="mb-[30px] flex w-full flex-col rounded-[23px] bg-slate-100 pb-[20px]"
      >
        {/** Print team name (pros/cons or if user wants, custom team name) */}
        <div className="mb-[15px] flex h-[78px] w-full flex-row items-center justify-center rounded-t-[23px] bg-slate-900 text-[28px] font-bold text-slate-50">
          <h1 className="w-full text-center">
            {titles !== undefined ? titles.pros : '찬성'}
          </h1>
          <h1 className="text-slate-500">|</h1>
          <h1 className="w-full text-center">
            {titles !== undefined ? titles.cons : '반대'}
          </h1>
        </div>

        {/** Print time table items(timeboxes) */}
        <div className="flex w-full flex-col space-y-[15px] px-[28px]">
          {items.map((item, index) => (
            <TimeTableItem
              key={index}
              isCurrent={currIndex === index}
              item={item}
            />
          ))}
        </div>
      </div>

      {/** Prev/next buttons */}
      <div className="flex w-max flex-row items-center justify-center space-x-[20px]">
        <button className="flex flex-row items-center space-x-[20px] rounded-full border border-slate-300 bg-slate-200 px-[32px] py-[20px] hover:bg-amber-400">
          <IoArrowUp className="size-[36px]" />
          <h1 className="text-[28px] font-semibold">이전 차례</h1>
        </button>
        <button className="flex flex-row items-center space-x-[20px] rounded-full border border-slate-300 bg-slate-200 px-[32px] py-[20px] hover:bg-amber-400">
          <IoArrowDown className="size-[36px]" />
          <h1 className="text-[28px] font-semibold">다음 차례</h1>
        </button>
      </div>
    </div>
  );
}
