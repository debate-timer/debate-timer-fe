import {
  TimeBoxInfo,
  DebateTypeToString,
  StanceToString,
} from '../../../../type/type';

interface TimeTableItemProps {
  item: TimeBoxInfo;
  isCurrent: boolean;
}

export default function TimeTableItem({ item, isCurrent }: TimeTableItemProps) {
  const titleText =
    item.type !== 'TIME_OUT'
      ? `${StanceToString[item.stance]} ${DebateTypeToString[item.type]}`
      : DebateTypeToString[item.type];
  const speakerText =
    item.stance === 'NEUTRAL' ? '' : `${item.speakerNumber}번 발언자`;
  let timeText: string;
  const bgStyle = isCurrent ? 'animate-color-transition' : 'bg-slate-200';
  const fontStyle = isCurrent ? 'text-slate-50' : 'text-slate-900';
  const weightStyle = isCurrent ? 'font-bold' : 'font-base';
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
    <div className="mx-auto flex w-full max-w-lg items-center justify-center">
      <div className="relative z-10 flex w-full items-center overflow-hidden rounded-xl bg-slate-50 p-[2.5px]">
        {isCurrent && (
          <div className="absolute inset-0 h-full w-full animate-rotate rounded-full bg-[conic-gradient(theme(colors.red.500)_20deg,transparent_120deg)]"></div>
        )}
        <div
          className={`relative z-20 flex w-full ${bgStyle} rounded-[0.60rem] px-8 py-2`}
        >
          <div
            className={`${weightStyle} flex flex-row items-center justify-between text-lg ${fontStyle}`}
          >
            <p className="w-32 text-center">{titleText}</p>
            <p className="w-32 text-center">{speakerText}</p>
            <p className="w-32 text-center">{timeText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
