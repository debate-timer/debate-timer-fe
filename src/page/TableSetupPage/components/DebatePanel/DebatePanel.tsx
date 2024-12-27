import { DEBATE_TYPE_LABELS, DebateInfo } from '../../../../type/type';
import { Formatting } from '../../../../util/formatting';

interface DebatePanelProps {
  info: DebateInfo;
}

export default function DebatePanel({ info }: DebatePanelProps) {
  const { stance, debateType, time, speakerNumber } = info;

  const debateTypeLabel = DEBATE_TYPE_LABELS[debateType];

  const isPros = stance === 'PROS';
  const isCons = stance === 'CONS';
  const isNeutralTimeout = debateType === 'TIME_OUT' && stance === 'NEUTRAL';
  const { minutes, seconds } = Formatting.formatSecondsToMinutes(time);
  const timeStr = `${minutes}분 ${seconds}초`;

  return (
    <div
      className={`flex w-full items-center ${
        isPros ? 'justify-start' : isCons ? 'justify-end' : 'justify-center'
      }`}
    >
      {(isPros || isCons) && (
        <div
          className={`flex w-1/2 flex-col items-center rounded-md ${
            isPros ? 'bg-blue-500' : 'bg-red-500'
          } p-4 font-bold text-white`}
        >
          <div>
            {debateTypeLabel} / {speakerNumber}번 토론자
          </div>
          <div className="text-2xl">{timeStr}</div>
        </div>
      )}

      {isNeutralTimeout && (
        <div className="w-full rounded-md bg-gray-200 py-2 text-center">
          <span className="font-medium text-gray-600">
            {debateTypeLabel} | {timeStr}
          </span>
        </div>
      )}
    </div>
  );
}
