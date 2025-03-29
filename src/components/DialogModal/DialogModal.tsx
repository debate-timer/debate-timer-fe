import { PropsWithChildren } from 'react';

interface DialogModalProps extends PropsWithChildren {
  left: {
    text: string;
    onClick: () => void;
    isBold?: boolean;
  };
  right: {
    text: string;
    onClick: () => void;
    isBold?: boolean;
  };
}

export default function DialogModal({
  children,
  left,
  right,
}: DialogModalProps) {
  if (left.isBold === undefined || null) {
    left.isBold = false;
  }
  if (right.isBold === undefined || null) {
    right.isBold = false;
  }

  return (
    <div
      data-testid="container"
      className="flex max-w-[500px] flex-col items-center"
    >
      {/** Children is displayed here */}
      {children}

      {/** Buttons */}
      <div className="w-full border-t border-neutral-300" />
      <div className="flex w-full flex-row items-center justify-center py-4">
        {/** Left button */}
        <button
          data-testid="button-left"
          className="w-1/2"
          onClick={() => left.onClick()}
        >
          <p
            className={`w-full ${left.isBold ? 'font-bold' : ''} text-neutral-1000`}
          >
            {left.text}
          </p>
        </button>

        {/** Right button */}
        <button
          data-testid="button-right"
          className="w-1/2"
          onClick={() => right.onClick()}
        >
          <p
            className={`w-full ${right.isBold ? 'font-bold' : ''} text-neutral-1000`}
          >
            {right.text}
          </p>
        </button>
      </div>
    </div>
  );
}
