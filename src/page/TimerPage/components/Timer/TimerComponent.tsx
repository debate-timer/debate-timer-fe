import {
  DebateInfo,
  DebateTypeToString,
  StanceToString,
} from '../../../../type/type';
import TimerDisplay from '../common/TimerDisplay';
import TimerController from './TimerController';
import { IoPerson } from 'react-icons/io5';

interface TimerComponentProps {
  debateInfo: DebateInfo;
  timer: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  onOpenModal: () => void;
}

// Main timer component that user can control
export default function TimerComponent({
  debateInfo,
  timer,
  startTimer,
  pauseTimer,
  resetTimer,
  onOpenModal,
}: TimerComponentProps) {
  // Set texts to be displayed
  const titleText =
    debateInfo.type !== 'TIME_OUT'
      ? `${StanceToString[debateInfo.stance]} ${DebateTypeToString[debateInfo.type]}`
      : DebateTypeToString[debateInfo.type];
  const speakerText =
    debateInfo.stance === 'NEUTRAL'
      ? ''
      : `${debateInfo.speakerNumber}번 발언자`;

  // Set background color by debateInfo's stance
  const bgColor =
    debateInfo.stance === 'NEUTRAL'
      ? 'bg-zinc-500'
      : debateInfo.stance === 'PROS'
        ? 'bg-blue-500'
        : 'bg-red-500';

  // Return React component
  return (
    <div className="flex h-full flex-row items-center space-x-4">
      <div
        className={`flex w-min flex-col ${bgColor} items-center rounded-[50px] border-4 border-zinc-50 px-8 py-8 shadow-2xl`}
      >
        {/* Title */}
        <div className="m-2 mb-8 flex flex-col items-center space-y-3">
          <h1 className="text-6xl font-bold text-zinc-50">{titleText}</h1>
          <div className="flex flex-row items-center space-x-3 text-zinc-50">
            {debateInfo.stance !== 'NEUTRAL' && <IoPerson size={25} />}
            <h1 className="text-3xl">{speakerText}</h1>
          </div>
        </div>

        {/* Timer */}
        <TimerDisplay timer={timer} />

        {/* Timer controller that includes buttons that can handle timer */}
        <TimerController
          onReset={resetTimer}
          onStart={startTimer}
          onPause={pauseTimer}
          onOpenModal={onOpenModal}
        />
      </div>
    </div>
  );
}
