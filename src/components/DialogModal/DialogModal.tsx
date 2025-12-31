import { PropsWithChildren } from 'react';

interface DialogButton {
  text: string;
  onClick: () => void;
  isBold?: boolean;
}

interface DialogModalProps extends PropsWithChildren {
  left?: DialogButton;
  right?: DialogButton;
}

export default function DialogModal({
  children,
  left,
  right,
}: DialogModalProps) {
  const leftIsBold = left?.isBold ?? false;
  const rightIsBold = right?.isBold ?? false;
  const hasButtons = Boolean(left || right);
  const isSingleButton = Boolean(left && !right) || Boolean(right && !left);
  const buttonWidthClass = isSingleButton ? 'w-full' : 'w-1/2';

  return (
    <div
      data-testid="container"
      className="flex max-w-[500px] flex-col items-center"
    >
      {/** Children is displayed here */}
      {children}

      {/** Buttons */}
      {hasButtons && (
        <>
          <div className="w-full border-t border-neutral-300" />
          <div className="flex w-full flex-row items-center justify-center">
            {left && (
              <button
                data-testid="button-left"
                className={`${buttonWidthClass} py-4 hover:bg-neutral-300`}
                onClick={left.onClick}
              >
                <p
                  className={`w-full ${leftIsBold ? 'font-bold' : ''} text-neutral-1000`}
                >
                  {left.text}
                </p>
              </button>
            )}

            {right && (
              <button
                data-testid="button-right"
                className={`${buttonWidthClass} py-4 hover:bg-brand`}
                onClick={right.onClick}
              >
                <p
                  className={`w-full ${rightIsBold ? 'font-bold' : ''} text-neutral-1000`}
                >
                  {right.text}
                </p>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
