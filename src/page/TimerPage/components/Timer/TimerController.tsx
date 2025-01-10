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
      <TimerTextButton
        name="이전 순서로"
        onClick={() => {
          toOtherItem(true);
        }}
      />
      <div className="w-8" />
      <TimerIconButton
        icon={<IoPlayOutline className="size-8" />}
        onClick={() => {
          onStart();
        }}
      />
      <div className="w-4" />
      <TimerIconButton
        icon={<IoStopOutline className="size-8" />}
        onClick={() => {
          onStop();
        }}
      />
      <div className="w-4" />
      <TimerIconButton
        icon={<IoTimerOutline className="size-8" />}
        onClick={() => {
          onReset();
        }}
      />
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
