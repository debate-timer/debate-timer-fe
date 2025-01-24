import TimerIconButton from '../common/TimerIconButton';
import { IoPauseOutline, IoPlayOutline, IoTimerOutline } from 'react-icons/io5';

interface TimerControllerProps {
  onPause: () => void;
  onStart: () => void;
  onReset: () => void;
  onOpenModal: () => void;
}

const iconSize = 40;

export default function TimerController({
  onPause,
  onStart,
  onReset,
  onOpenModal,
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

      {/*Additional discussion time button*/}
      <button
        className="rounded-full border-2 border-zinc-50 bg-zinc-200 px-8 py-4 hover:bg-zinc-300"
        onClick={() => {
          console.log('# Additional discussion time button clicked');
          onOpenModal();
        }}
      >
        <h1 className="text-2xl font-bold">추가 작전 시간</h1>
      </button>
    </div>
  );
}
