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
      className="flex h-[40px] w-[65px] items-center justify-center rounded-[10px] bg-neutral-300 shadow-lg lg:h-[45px] lg:w-[80px] lg:rounded-[13px] xl:h-[50px] xl:w-[100px]"
      onClick={() => addOnTimer()}
    >
      <p className="text-center text-[18px] font-semibold lg:text-[20px] xl:text-[25px]">
        {text}
      </p>
    </button>
  );
}
