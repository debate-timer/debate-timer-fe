import { LuRefreshCcw } from 'react-icons/lu';
import TimerIconButton from '../common/TimerIconButton';
import { IoPauseOutline, IoPlayOutline } from 'react-icons/io5';
import useMobile from '../../../../hooks/useMobile';

interface TimerControllerProps {
  isRunning: boolean;
  onPause: () => void;
  onStart: () => void;
  onReset: () => void;
  onOpenModal: () => void;
  isWarningBellOn: boolean;
  isFinishBellOn: boolean;
  onChangeWarningBell: () => void;
  onChangeFinishBell: () => void;
}

export default function TimerController({
  isRunning,
  onPause,
  onStart,
  onReset,
  onOpenModal,
  isWarningBellOn,
  isFinishBellOn,
  onChangeWarningBell,
  onChangeFinishBell,
}: TimerControllerProps) {
  const isMobile = useMobile();

  return (
    <div className="flex flex-row items-center space-x-4 md:space-x-8">
      {/* Timer start button */}
      {isRunning && (
        <TimerIconButton
          icon={<IoPauseOutline size={isMobile ? 20 : 40} />}
          style={{
            bgColor: 'bg-slate-50',
            hoverColor: 'hover:bg-slate-300',
            contentColor: 'text-slate-900',
          }}
          onClick={() => {
            onPause();
          }}
        />
      )}

      {/* Timer pause button */}
      {!isRunning && (
        <TimerIconButton
          icon={<IoPlayOutline size={isMobile ? 20 : 40} />}
          style={{
            bgColor: 'bg-slate-50',
            hoverColor: 'hover:bg-slate-300',
            contentColor: 'text-slate-900',
          }}
          onClick={() => {
            onStart();
          }}
        />
      )}

      {/* Timer reset button */}
      <TimerIconButton
        icon={<LuRefreshCcw size={isMobile ? 20 : 40} />}
        style={{
          bgColor: 'bg-slate-50',
          hoverColor: 'hover:bg-slate-300',
          contentColor: 'text-slate-900',
        }}
        onClick={() => {
          onReset();
        }}
      />

      {/* Additional discussion time button */}
      <button
        className="rounded-full border-2 border-zinc-50 bg-zinc-200 px-8 py-3 hover:bg-zinc-300"
        onClick={() => {
          console.log('# Additional discussion time button clicked');
          onOpenModal();
        }}
      >
        <h1 className="w-max text-xl font-bold md:text-2xl">작전 시간 사용</h1>
      </button>

      {/* Sound on/off checkboxes */}
      <div className="flex flex-col space-y-2">
        <div className="flex flex-row space-x-2 rounded-full border-2 border-slate-50 bg-slate-200 px-4 py-2">
          <input
            type="checkbox"
            checked={isWarningBellOn}
            onChange={() => onChangeWarningBell()}
          />
          <p className="w-max font-semibold">30초 경고</p>
        </div>
        <div className="flex flex-row space-x-2 rounded-full border-2 border-slate-50 bg-slate-200 px-4 py-2">
          <input
            type="checkbox"
            checked={isFinishBellOn}
            onChange={() => onChangeFinishBell()}
          />
          <p className="w-max font-semibold">0초 경고</p>
        </div>
      </div>
    </div>
  );
}
