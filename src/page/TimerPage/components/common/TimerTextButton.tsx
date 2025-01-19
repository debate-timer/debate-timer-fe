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
      className="w-[160px] rounded-2xl bg-zinc-50 px-6 py-3 text-2xl font-bold text-zinc-900 hover:bg-zinc-400"
    >
      {name}
    </button>
  );
}
