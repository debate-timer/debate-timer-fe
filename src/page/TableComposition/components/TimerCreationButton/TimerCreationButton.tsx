interface TimerCreationButtonProps {
  leftOnClick: () => void;
  rightOnClick: () => void;
}
export default function TimerCreationButton(props: TimerCreationButtonProps) {
  const { leftOnClick, rightOnClick } = props;
  return (
    <div className="flex w-full items-center justify-around">
      <button
        className="flex h-10 w-5/12 items-center justify-center rounded-md bg-gray-200 font-bold text-black"
        onClick={leftOnClick}
      >
        +
      </button>

      <button
        className="flex h-10 w-5/12 items-center justify-center rounded-md bg-gray-200 font-bold text-black"
        onClick={rightOnClick}
      >
        +
      </button>
    </div>
  );
}
