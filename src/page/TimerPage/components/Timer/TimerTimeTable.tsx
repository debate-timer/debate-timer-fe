import { IoArrowBack, IoArrowForward } from 'react-icons/io5';
import { DebateInfo } from '../../../../type/type';
import TimeTableItem from './TimeTableItem';

interface TimerTimeTableProps {
  currIndex: number;
  tables: DebateInfo[];
  moveToOtherItem: (goToPrev: boolean) => void;
}

export default function TimerTimeTable({
  currIndex,
  tables,
  moveToOtherItem,
}: TimerTimeTableProps) {
  return (
    <div className="flex flex-col items-center space-y-3">
      {tables.map((value, index) => (
        <TimeTableItem
          key={index}
          isCurrent={currIndex === index}
          item={value}
        />
      ))}

      <div className="flex flex-row space-x-4 pt-5">
        <button onClick={() => moveToOtherItem(true)}>
          <div className="flex flex-row items-center space-x-2 rounded-full border-2 border-slate-50 bg-slate-200 px-6 py-3 hover:bg-slate-400">
            <IoArrowBack size={24} />
            <h1 className="font-bold">이전 차례</h1>
          </div>
        </button>

        <button onClick={() => moveToOtherItem(false)}>
          <div className="flex flex-row items-center space-x-2 rounded-full border-2 border-slate-50 bg-slate-200 px-6 py-3 hover:bg-slate-400">
            <h1 className="font-bold">다음 차례</h1>
            <IoArrowForward size={24} />
          </div>
        </button>
      </div>
    </div>
  );
}
