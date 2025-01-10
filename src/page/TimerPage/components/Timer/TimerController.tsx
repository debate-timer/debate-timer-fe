import TimerIconButton from '../common/TimerIconButton';
import TimerTextButton from '../common/TimerTextButton';
import { IoPlayOutline, IoStopOutline, IoTimerOutline } from 'react-icons/io5';

interface TimerControllerProps {
  onStop: () => void;
  onStart: () => void;
  onReset: () => void;
  toOtherItem: (isPrev: boolean) => void;
}

export default function TimerController({
  onStop,
  onStart,
  onReset,
  toOtherItem,
}: TimerControllerProps) {
  return (
    <div className="flex flex-row items-center">
      {/* Prev button */}
      <TimerTextButton
        name="이전 순서로"
        onClick={() => {
          toOtherItem(true);
        }}
      />

      {/* Timer start button */}
      <div className="w-8" />
      <TimerIconButton
        icon={<IoPlayOutline className="size-8" />}
        bgColor="bg-emerald-500"
        hoverColor="hover:bg-emerald-600"
        contentColor="text-zinc-50"
        onClick={() => {
          onStart();
        }}
      />

      {/* Timer stop button */}
      <div className="w-4" />
      <TimerIconButton
        icon={<IoStopOutline className="size-8" />}
        bgColor="bg-amber-500"
        hoverColor="hover:bg-amber-600"
        contentColor="text-zinc-50"
        onClick={() => {
          onStop();
        }}
      />

      {/* Timer reset button */}
      <div className="w-4" />
      <TimerIconButton
        icon={<IoTimerOutline className="size-8" />}
        bgColor="bg-red-500"
        hoverColor="hover:bg-red-600"
        contentColor="text-zinc-50"
        onClick={() => {
          onReset();
        }}
      />

      {/* Next button */}
      <div className="w-8" />
      <TimerTextButton
        name="다음 순서로"
        onClick={() => {
          toOtherItem(false);
        }}
      />
    </div>
  );
}
