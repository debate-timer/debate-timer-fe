import { ButtonHTMLAttributes } from 'react';

export default function TimerCreationButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return (
    <div className="my-4 flex w-full items-center justify-center">
      <button
        className="flex h-10 w-4/5 items-center justify-center rounded-md bg-neutral-300 font-bold hover:bg-neutral-400"
        {...props}
      >
        +
      </button>
    </div>
  );
}
