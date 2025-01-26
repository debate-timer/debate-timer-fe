import { Formatting } from '../../../../util/formatting';

interface TimerProps {
  bg?: string;
  timer: number;
}
export default function TimerDisplay({ bg, timer }: TimerProps) {
  const bgText = bg === undefined ? 'bg-zinc-100' : bg;

  return (
    <div
      className={`mb-12 flex flex-row items-center justify-center space-x-4 rounded-[50px] ${bgText} p-8`}
    >
      {/* Prints -(minus) if remaining time is negative */}
      {timer < 0 && <h1 className="py-2 text-9xl font-bold">-</h1>}

      {/* Minutes */}
      <div className="flex w-[240px] justify-center rounded-[50px] bg-zinc-200 py-4">
        <h1 className="text-9xl font-bold">
          {Formatting.formatTwoDigits(Math.floor(Math.abs(timer) / 60))}
        </h1>
      </div>

      {/* Colon */}
      <h1 className="py-2 text-8xl">:</h1>

      {/* Seconds */}
      <div className="flex w-[240px] justify-center rounded-[50px] bg-zinc-200 py-4">
        <h1 className="text-9xl font-bold">
          {Formatting.formatTwoDigits(Math.abs(timer % 60))}
        </h1>
      </div>
    </div>
  );
}
