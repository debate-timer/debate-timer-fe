import {
  IoChevronBack,
  IoChevronForward,
  IoPerson,
  IoTime,
} from 'react-icons/io5';
import { DebateInfo } from '../../../type/type';
import { Formatting } from '../../../util/formatting';

interface DebateInfoSummaryProps {
  debateInfo: DebateInfo;
  isPrev: boolean;
}

// Main timer component that user can control
export default function DebateInfoSummary({
  debateInfo,
  isPrev,
}: DebateInfoSummaryProps) {
  const titleText =
    debateInfo.debateType !== 'TIME_OUT'
      ? `${Formatting.formatStanceToString(debateInfo.stance)} ${Formatting.formatDebateTypeToString(debateInfo.debateType)}`
      : Formatting.formatDebateTypeToString(debateInfo.debateType);
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
  const alignOption = isPrev ? 'items-start' : 'items-end';
  const prevNextText = isPrev ? '이전 순서' : '다음 순서';

  return (
    <div className={`flex flex-col space-y-4 p-4 ${alignOption}`}>
      <div className="mx-4 flex flex-row items-center space-x-2">
        {isPrev && <IoChevronBack className="size-[30px]" />}
        <h1 className="text-3xl font-bold">{prevNextText}</h1>
        {!isPrev && <IoChevronForward className="size-[30px]" />}
      </div>
      <div
        className={`m-4 flex h-[120px] flex-row items-center justify-center space-x-4 rounded-2xl p-4 ${bgColor}`}
      >
        <h1 className="text-4xl font-bold text-zinc-50">{titleText}</h1>
        <div className="flex flex-col items-start rounded-2xl bg-zinc-50 px-5 py-3">
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
            <h1 className="text-xl text-zinc-900">3분 0초</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
