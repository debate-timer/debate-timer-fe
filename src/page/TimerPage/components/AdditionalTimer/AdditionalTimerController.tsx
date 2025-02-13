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
              bgColor: 'bg-slate-200',
              hoverColor: 'hover:bg-slate-400',
              contentColor: 'text-slate-900',
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
              bgColor: 'bg-slate-200',
              hoverColor: 'hover:bg-slate-400',
              contentColor: 'text-slate-900',
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
