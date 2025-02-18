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
    <div
      data-testid="time-table"
      className="flex w-[891px] flex-col rounded-[23px] bg-slate-100 pb-[20px]"
    >
      {/* Print team name (pros/cons or if user wants, custom team name) */}
      <div className="mb-[15px] flex h-[78px] w-full flex-row items-center justify-center rounded-t-[23px] bg-slate-900 text-[28px] font-bold text-slate-50">
        <h1 className="w-[420px] text-center">
          {titles !== undefined ? titles.pros : '찬성'}
        </h1>
        <h1 className="text-slate-500">|</h1>
        <h1 className="w-[420px] text-center">
          {titles !== undefined ? titles.cons : '반대'}
        </h1>
      </div>

      {/* Print time table items(timeboxes) */}
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
  );
}
