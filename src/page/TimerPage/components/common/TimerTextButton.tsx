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
      className="h-[50px] rounded-2xl bg-zinc-50 px-4 py-2 text-lg font-bold text-zinc-900 hover:bg-zinc-400"
    >
      {name}
    </button>
  );
}
