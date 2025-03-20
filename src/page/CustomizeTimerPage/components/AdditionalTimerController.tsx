import { FaPlay, FaStop } from 'react-icons/fa';
import AdditionalTimerControlButton from './AdditionalTimerControlButton';

interface AdditionalTimerControllerProps {
  onStart: () => void;
  onPause: () => void;
  addOnTimer: (delta: number) => void;
  isRunning: boolean;
}

export default function AdditionalTimerController({
  onStart,
  onPause,
  addOnTimer,
  isRunning,
}: AdditionalTimerControllerProps) {
  return (
    <div
      data-testid="additional-timer-controller"
      className="flex h-[180px] w-[730px] flex-row items-center justify-center"
    >
      {/* Buttons that subtracts times */}
      <AdditionalTimerControlButton
        text="-1분"
        addOnTimer={() => addOnTimer(-60)}
      />
      <div className="w-[10px]" />
      <AdditionalTimerControlButton
        text="-30초"
        addOnTimer={() => addOnTimer(-30)}
      />

      {/* Start and pause buttons */}
      {isRunning && (
        <button
          className="mx-[25px] size-[152px] rounded-full bg-neutral-900 p-[45px] hover:bg-[#000000]"
          onClick={() => onPause()}
        >
          <FaStop className="size-full justify-center text-neutral-50" />
        </button>
      )}
      {!isRunning && (
        <button
          className="mx-[25px] size-[152px] rounded-full bg-neutral-900 p-[45px] hover:bg-[#000000]"
          onClick={() => onStart()}
        >
          <FaPlay className="size-full justify-center text-neutral-50" />
        </button>
      )}

      {/* Buttons that adds times */}
      <AdditionalTimerControlButton
        text="+30초"
        addOnTimer={() => addOnTimer(30)}
      />
      <div className="w-[10px]" />
      <AdditionalTimerControlButton
        text="+1분"
        addOnTimer={() => addOnTimer(60)}
      />
    </div>
  );
}
