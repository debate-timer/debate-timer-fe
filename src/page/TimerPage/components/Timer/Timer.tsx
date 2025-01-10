interface TimerProps {
  timer: number;
}

function formatTwoDigits(num: number): string {
  return num.toString().padStart(2, '0');
}

export default function Timer({ timer }: TimerProps) {
  return (
    <div className="flex w-[500px] flex-row items-center justify-center space-x-4 rounded-[50px] bg-zinc-50 p-4">
      {timer < 0 && <h1 className="py-2 text-8xl font-bold">-</h1>}

      <div className="flex w-[180px] justify-center rounded-[50px] bg-zinc-200 py-4">
        <h1 className="text-8xl font-bold">
          {formatTwoDigits(
            Math.floor(Math.abs(timer) / 60) * (timer < 0 ? -1 : 1),
          )}
        </h1>
      </div>

      <h1 className="py-2 text-6xl font-bold">:</h1>

      <div className="flex w-[180px] justify-center rounded-[50px] bg-zinc-200 py-4">
        <h1 className="text-8xl font-bold">
          {formatTwoDigits(Math.abs(timer % 60))}
        </h1>
      </div>
    </div>
  );
}
