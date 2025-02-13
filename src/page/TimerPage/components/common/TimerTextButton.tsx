interface TimerTextButtonProps {
  onClick: () => void;
  name: string;
}

export default function TimerTextButton({
  name,
  onClick,
}: TimerTextButtonProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-full bg-slate-200 px-6 py-2 text-lg font-bold text-slate-900 hover:bg-zinc-400"
    >
      {name}
    </button>
  );
}
