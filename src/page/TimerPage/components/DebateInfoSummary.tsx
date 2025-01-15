import {
  IoChevronBack,
  IoChevronForward,
  IoPerson,
  IoTime,
} from 'react-icons/io5';
import {
  DebateInfo,
  DebateTypeToString,
  StanceToString,
} from '../../../type/type';
import TimerIconButton from './common/TimerIconButton';

interface DebateInfoSummaryProps {
  debateInfo: DebateInfo;
  isPrev: boolean;
  moveToOtherItem: (isPrev: boolean) => void;
}

// Main timer component that user can control
export default function DebateInfoSummary({
  debateInfo,
  isPrev,
  moveToOtherItem,
}: DebateInfoSummaryProps) {
  // const alignOption = isPrev ? 'items-start' : 'items-end';
  // const prevNextText = isPrev ? '이전 순서' : '다음 순서';
  const titleText =
    debateInfo.type !== 'TIME_OUT'
      ? `${StanceToString[debateInfo.stance]} ${DebateTypeToString[debateInfo.type]}`
      : DebateTypeToString[debateInfo.type];
  const speakerText =
    debateInfo.stance === 'NEUTRAL'
      ? ''
      : `${debateInfo.speakerNumber}번 발언자`;
  const bgColor =
    debateInfo.stance === 'NEUTRAL'
      ? 'bg-zinc-500'
      : debateInfo.stance === 'PROS'
        ? 'bg-blue-500'
        : 'bg-red-500';
  let timeText: string;

  if (debateInfo.time < 60) {
    timeText = `${debateInfo.time % 60}초`;
  } else {
    if (debateInfo.time % 60 === 0) {
      timeText = `${Math.floor(debateInfo.time / 60)}분`;
    } else {
      timeText = `${Math.floor(debateInfo.time / 60)}분 ${debateInfo.time % 60}초`;
    }
  }

  return (
    <div className={`flex flex-col items-center space-y-4 p-4`}>
      <div className="flex">
        {isPrev && (
          <TimerIconButton
            icon={<IoChevronBack className="size-10" />}
            style={{
              bgColor: 'bg-zinc-300',
              hoverColor: 'hover:bg-zinc-500',
              contentColor: 'text-zinc-900',
              className: 'shadow-2xl',
            }}
            onClick={() => {
              moveToOtherItem(isPrev);
            }}
          />
        )}
        {!isPrev && (
          <TimerIconButton
            icon={<IoChevronForward className="size-10" />}
            style={{
              bgColor: 'bg-zinc-300',
              hoverColor: 'hover:bg-zinc-500',
              contentColor: 'text-zinc-900',
              className: 'shadow-2xl',
            }}
            onClick={() => {
              moveToOtherItem(isPrev);
            }}
          />
        )}
      </div>

      <div
        className={`m-4 flex w-[240px] flex-col items-center justify-center space-y-4 rounded-2xl border-2 border-zinc-50 p-4 shadow-2xl ${bgColor}`}
      >
        <h1 className="text-3xl font-bold text-zinc-50">{titleText}</h1>
        <div className="flex w-full flex-col items-start rounded-2xl bg-zinc-50 p-4">
          {/* Next speaker */}
          {debateInfo.stance !== 'NEUTRAL' && (
            <div className="flex flex-row items-center justify-center space-x-3">
              <IoPerson />
              <h1 className="text-xl text-zinc-900">{speakerText}</h1>
            </div>
          )}

          {/* Available speaking time */}
          <div className="flex flex-row items-center justify-center space-x-3">
            <IoTime />
            <h1 className="text-xl text-zinc-900">{timeText}</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
