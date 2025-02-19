import { RiSpeakFill } from 'react-icons/ri';
import { DebateTypeToString, TimeBoxInfo } from '../../../type/type';
import { Formatting } from '../../../util/formatting';

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
  const width = item.stance !== 'NEUTRAL' ? 'w-[360px]' : 'w-full';
  const minute = Math.floor(Math.abs(item.time) / 60);
  const second = Math.abs(item.time % 60);
  const timeText = `${Formatting.formatTwoDigits(minute)}:${Formatting.formatTwoDigits(second)}`;

  return (
    <div
      data-testid="time-table-item"
      className={`flex h-[69px] ${width} flex-row items-center justify-center space-x-2 ${pos} ${bgColorClass} ${roundedClass} p-[16px] text-[28px] font-bold ${textColorClass}`}
    >
      {/* Print what type is this sequence (e.g., opening, time-out, etc.) */}
      <h1>{DebateTypeToString[item.type]}</h1>

      {/* Print running time */}
      <p>| {timeText}</p>

      {/* Print speaker's number, if necessary */}
      {item.stance === 'NEUTRAL' ||
        (item.speakerNumber !== undefined && (
          <>
            <h1>|</h1>
            <RiSpeakFill className="size-[27px]" />
            <h1>{item.speakerNumber}번</h1>
          </>
        ))}
    </div>
  );
}
