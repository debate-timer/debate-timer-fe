interface AdditionalTimerControlButtonProps {
  text: string;
  addOnTimer: () => void;
}

export default function AdditionalTimerControlButton({
  text,
  addOnTimer,
}: AdditionalTimerControlButtonProps) {
  return (
    <button
      className="flex h-[50px] w-[100px] items-center justify-center rounded-[13px] bg-neutral-300 shadow-lg"
      onClick={() => addOnTimer()}
    >
      <p className="text-center text-[25px] font-semibold">{text}</p>
    </button>
  );
}
