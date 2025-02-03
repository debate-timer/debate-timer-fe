import { LuRefreshCcw } from 'react-icons/lu';
import TimerIconButton from '../common/TimerIconButton';
import { IoPauseOutline, IoPlayOutline } from 'react-icons/io5';

interface TimerControllerProps {
  isRunning: boolean;
  onPause: () => void;
  onStart: () => void;
  onReset: () => void;
  onOpenModal: () => void;
}

const iconSize = 40;

export default function TimerController({
  isRunning,
  onPause,
  onStart,
  onReset,
  onOpenModal,
}: TimerControllerProps) {
  return (
    <div className="flex flex-row items-center space-x-8">
      {/* Timer start button */}
      {isRunning && (
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
      )}

      {/* Timer pause button */}
      {!isRunning && (
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
      )}

      {/* Timer reset button */}
      <TimerIconButton
        icon={<LuRefreshCcw size={iconSize} />}
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
        <h1 className="text-2xl font-bold">작전 시간 사용</h1>
      </button>
    </div>
  );
}
