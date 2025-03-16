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
      ? 'bg-neutral-500'
      : item.stance === 'PROS'
        ? 'bg-camp-blue'
        : 'bg-camp-red'
    : 'bg-neutral-300';
  const textColorClass = isCurrent ? 'text-neutral-50' : 'text-neutral-900';
  const roundedClass = isCurrent ? 'rounded-[23px]' : '';
  const pos =
    item.stance !== 'NEUTRAL'
      ? item.stance === 'PROS'
        ? 'justify-self-start'
        : 'justify-self-end'
      : 'justify-self-center';
  const width = item.stance !== 'NEUTRAL' ? 'w-1/2' : 'w-full';
  const minute = Math.floor(Math.abs(item.time) / 60);
  const second = Math.abs(item.time % 60);
  const timeText = `${Formatting.formatTwoDigits(minute)}:${Formatting.formatTwoDigits(second)}`;

  return (
    <div
      data-testid="time-table-item"
      className={`flex h-max ${width} flex-row items-center justify-center space-x-2 ${pos} ${bgColorClass} ${roundedClass} p-[16px] text-[28px] font-bold ${textColorClass}`}
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
