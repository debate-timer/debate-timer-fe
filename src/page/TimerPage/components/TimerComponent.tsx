import { DebateInfo } from '../../../type/type';
import { Formatting } from '../../../util/formatting';
import Timer from './Timer/Timer';
import TimerController from './Timer/TimerController';

interface TimerComponentProps {
  debateInfo: DebateInfo;
  timer: number;
  resetTimer: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  moveToOtherItem: (isPrev: boolean) => void;
}

// Main timer component that user can control
export default function TimerComponent({
  debateInfo,
  timer,
  resetTimer,
  startTimer,
  stopTimer,
  moveToOtherItem,
}: TimerComponentProps) {
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
  /*
  const bgColor =
    timerState === 'RESET'
      ? 'bg-zinc-500'
      : timerState === 'RUNNING'
        ? 'bg-green-500'
        : 'bg-red-500';
  */

  return (
    <div
      className={`flex flex-col items-center space-y-4 rounded-[50px] border-4 border-zinc-50 px-24 py-8 shadow-2xl ${bgColor}`}
    >
      <div className="m-2 flex flex-col items-center space-y-2">
        <h1 className="text-5xl font-bold">{titleText}</h1>
        <h1 className="text-3xl">{speakerText}</h1>
      </div>

      <Timer timer={timer} />

      <TimerController
        onReset={resetTimer}
        onStart={startTimer}
        onStop={stopTimer}
        toOtherItem={moveToOtherItem}
      />
    </div>
  );
}
