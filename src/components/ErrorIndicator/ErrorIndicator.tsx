import { PropsWithChildren } from 'react';
import { MdErrorOutline } from 'react-icons/md';

interface ErrorIndicatorProps extends PropsWithChildren {
  onClickRetry?: () => void;
}

export default function ErrorIndicator({
  children = '데이터를 불러오지 못했어요. 다시 시도할까요?',
  onClickRetry,
}: ErrorIndicatorProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-4 p-16">
      <MdErrorOutline className="size-32 text-red-500" />
      <p className="break-keep text-center text-xl">{children}</p>

      {onClickRetry && (
        <button
          onClick={() => onClickRetry()}
          className="small-button enabled px-8 py-1"
        >
          다시 시도하기
        </button>
      )}
    </div>
  );
}
