import TimerIconButton from '../common/TimerIconButton';
import { IoPauseOutline, IoPlayOutline, IoTimerOutline } from 'react-icons/io5';

interface TimerControllerProps {
  onPause: () => void;
  onStart: () => void;
  onReset: () => void;
  toOtherItem: (isPrev: boolean) => void;
}

export default function TimerController({
  onPause,
  onStart,
  onReset,
}: TimerControllerProps) {
  return (
    <div className="flex flex-row items-center space-x-8">
      {/* Timer start button */}
      <TimerIconButton
        icon={<IoPlayOutline className="size-12" />}
        bgColor="bg-emerald-500"
        hoverColor="hover:bg-emerald-600"
        contentColor="text-zinc-50"
        onClick={() => {
          onStart();
        }}
      />

      {/* Timer pause button */}
      <TimerIconButton
        icon={<IoPauseOutline className="size-12" />}
        bgColor="bg-amber-500"
        hoverColor="hover:bg-amber-600"
        contentColor="text-zinc-50"
        onClick={() => {
          onPause();
        }}
      />

      {/* Timer reset button */}
      <TimerIconButton
        icon={<IoTimerOutline className="size-12" />}
        bgColor="bg-red-500"
        hoverColor="hover:bg-red-600"
        contentColor="text-zinc-50"
        onClick={() => {
          onReset();
        }}
      />
    </div>
  );
}
