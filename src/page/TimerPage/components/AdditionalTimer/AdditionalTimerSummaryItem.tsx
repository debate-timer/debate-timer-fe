import { IoTimeOutline } from 'react-icons/io5';
import {
  DebateInfo,
  DebateTypeToString,
  StanceToString,
} from '../../../../type/type';

interface AdditionalTimerSummaryItemProps {
  item: DebateInfo;
}

export default function AdditionalTimerSummaryItem({
  item,
}: AdditionalTimerSummaryItemProps) {
  const titleText =
    item.type !== 'TIME_OUT'
      ? `${StanceToString[item.stance]} ${DebateTypeToString[item.type]}`
      : DebateTypeToString[item.type];
  const bgColor =
    item.stance === 'NEUTRAL'
      ? 'bg-zinc-500'
      : item.stance === 'PROS'
        ? 'bg-blue-500'
        : 'bg-red-500';
  let timeText: string;

  if (item.time < 60) {
    timeText = `${item.time % 60}초`;
  } else {
    if (item.time % 60 === 0) {
      timeText = `${Math.floor(item.time / 60)}분`;
    } else {
      timeText = `${Math.floor(item.time / 60)}분 ${item.time % 60}초`;
    }
  }

  return (
    <div
      className={`flex w-[150px] flex-col items-center rounded-2xl ${bgColor} px-6 py-3`}
    >
      {/* Stance and sequence (e.g., Pros final) */}
      <h1 className="text-lg font-bold text-zinc-50">{titleText}</h1>

      {/* Time */}
      <div className="flex flex-row items-center justify-center space-x-2">
        <IoTimeOutline size={15} className="text-zinc-50" />
        <h1 className="text-m text-zinc-50">{timeText}</h1>
      </div>
    </div>
  );
}
