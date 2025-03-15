import { PropsWithChildren } from 'react';

interface DialogModalProps extends PropsWithChildren {
  leftText: string;
  rightText: string;
  onLeftClick: () => void;
  onRightClick: () => void;
  isLeftBold?: boolean;
  isRightBold?: boolean;
}

export default function DialogModal({
  children,
  leftText,
  rightText,
  onLeftClick,
  onRightClick,
  isLeftBold = false,
  isRightBold = false,
}: DialogModalProps) {
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
          onClick={() => onLeftClick()}
        >
          <p
            className={`w-full ${isLeftBold ? 'font-bold' : ''} text-brand-sub2`}
          >
            {leftText}
          </p>
        </button>

        {/** Right button */}
        <button
          data-testid="button-right"
          className="w-1/2"
          onClick={() => onRightClick()}
        >
          <p
            className={`w-full ${isRightBold ? 'font-bold' : ''} text-brand-sub2`}
          >
            {rightText}
          </p>
        </button>
      </div>
    </div>
  );
}
