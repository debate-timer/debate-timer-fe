import { RiSpeakFill } from 'react-icons/ri';
import { DebateTypeToString, TimeBoxInfo } from '../../../type/type';

interface TimeTableItem {
  isCurrent: boolean;
  item: TimeBoxInfo;
}

export default function TimeTableItem({ isCurrent, item }: TimeTableItem) {
  const bgColorClass = isCurrent
    ? item.stance === 'NEUTRAL'
      ? 'bg-slate-500'
      : item.stance === 'PROS'
        ? 'bg-blue-500'
        : 'bg-red-500'
    : 'bg-slate-300';
  const textColorClass = isCurrent ? 'text-slate-50' : 'text-slate-900';
  const roundedClass = isCurrent ? 'rounded-[23px]' : '';
  const pos =
    item.stance !== 'NEUTRAL'
      ? item.stance === 'PROS'
        ? 'self-start'
        : 'self-end'
      : 'self-center';
  const width = item.stance !== 'NEUTRAL' ? 'w-[420px]' : 'w-full';
  const minute = Math.floor(Math.abs(item.time) / 60);
  const second = Math.abs(item.time % 60);

  return (
    <div
      data-testid="time-table-item"
      className={`flex h-[69px] ${width} flex-row items-center justify-center space-x-2 ${pos} ${bgColorClass} ${roundedClass} p-[16px] text-[28px] font-bold ${textColorClass}`}
    >
      <h1>{DebateTypeToString[item.type]}</h1>
      <>
        <h1>| </h1>
        {minute !== 0 && <h1>{minute}분 </h1>}
        <h1>{second}초</h1>
      </>
      {item.speakerNumber !== undefined && (
        <>
          <h1>|</h1>
          <RiSpeakFill className="size-[27px]" />
          <h1>{item.speakerNumber}번</h1>
        </>
      )}
    </div>
  );
}
