import TimerIconButton from '../common/TimerIconButton';
import { IoPauseOutline, IoPlayOutline, IoTimerOutline } from 'react-icons/io5';

interface TimerControllerProps {
  onPause: () => void;
  onStart: () => void;
  onReset: () => void;
}

const iconSize = 40;

export default function TimerController({
  onPause,
  onStart,
  onReset,
}: TimerControllerProps) {
  return (
    <div className="flex flex-row items-center space-x-8">
      {/* Timer start button */}
      <TimerIconButton
        icon={<IoPlayOutline size={iconSize} />}
        style={{
          bgColor: 'bg-emerald-500',
          hoverColor: 'hover:bg-emerald-600',
          contentColor: 'text-zinc-50',
        }}
        onClick={() => {
          onStart();
        }}
      />

      {/* Timer pause button */}
      <TimerIconButton
        icon={<IoPauseOutline size={iconSize} />}
        style={{
          bgColor: 'bg-amber-500',
          hoverColor: 'hover:bg-amber-600',
          contentColor: 'text-zinc-50',
        }}
        onClick={() => {
          onPause();
        }}
      />

      {/* Timer reset button */}
      <TimerIconButton
        icon={<IoTimerOutline size={iconSize} />}
        style={{
          bgColor: 'bg-red-500',
          hoverColor: 'hover:bg-red-600',
          contentColor: 'text-zinc-50',
        }}
        onClick={() => {
          onReset();
        }}
      />
    </div>
  );
}
