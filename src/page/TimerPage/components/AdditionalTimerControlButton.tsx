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
      className="flex h-[45px] w-[80px] items-center justify-center rounded-[13px] bg-neutral-300 shadow-lg xl:h-[50px] xl:w-[100px]"
      onClick={() => addOnTimer()}
    >
      <p className="text-center text-[20px] font-semibold xl:text-[25px]">
        {text}
      </p>
    </button>
  );
}
