import { RiSpeakFill } from 'react-icons/ri';
import { DebateTypeToString, TimeBoxInfo } from '../../../type/type';

interface TimeTableItem {
  isCurrent: boolean;
  data: TimeBoxInfo;
}

export default function TimeTableItem({ isCurrent, data }: TimeTableItem) {
  const bgColorClass = isCurrent
    ? data.stance === 'NEUTRAL'
      ? 'bg-slate-500'
      : data.stance === 'PROS'
        ? 'bg-blue-500'
        : 'bg-red-500'
    : 'bg-slate-300';
  const textColorClass = isCurrent ? 'text-slate-50' : 'text-slate-900';
  const roundedClass = isCurrent ? 'rounded-[23px]' : '';
  const minute = Math.floor(Math.abs(data.time) / 60);
  const second = Math.abs(data.time % 60);

  return (
    <div
      className={`flex h-[69px] w-[298px] flex-row items-center justify-center space-x-2 ${bgColorClass} ${roundedClass} p-[16px] text-[28px] font-bold ${textColorClass}`}
    >
      <h1>{DebateTypeToString[data.type]}</h1>
      <>
        <h1>| </h1>
        {minute !== 0 && <h1>{minute}분 </h1>}
        <h1>{second}초</h1>
      </>
      {data.speakerNumber !== undefined && (
        <>
          <h1>|</h1>
          <RiSpeakFill className="size-[27px]" />
          <h1>{data.speakerNumber}번</h1>
        </>
      )}
    </div>
  );
}
