import { IoPauseOutline, IoPlayOutline } from 'react-icons/io5';
import TimerIconButton from '../common/TimerIconButton';
import TimerTextButton from '../common/TimerTextButton';

interface AdditionalTimerControllerProps {
  isRunning: boolean;
  onPause: () => void;
  onStart: () => void;
  addOnTimer: (value: number) => void;
}

const iconSize = 40;

export default function AdditionalTimerController({
  isRunning,
  onPause,
  onStart,
  addOnTimer,
}: AdditionalTimerControllerProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex flex-row items-center space-x-8">
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
      </div>

      <div className="flex flex-row items-center space-x-4">
        <TimerTextButton name={'- 1분'} onClick={() => addOnTimer(-60)} />
        <TimerTextButton name={'- 30초'} onClick={() => addOnTimer(-30)} />
        <TimerTextButton name={'+ 30초'} onClick={() => addOnTimer(30)} />
        <TimerTextButton name={'+ 1분'} onClick={() => addOnTimer(60)} />
      </div>
    </div>
  );
}
