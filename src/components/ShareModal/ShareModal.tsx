import { QRCodeSVG } from 'qrcode.react';
import { IoLinkOutline, IoShareOutline } from 'react-icons/io5';
import LoadingSpinner from '../LoadingSpinner';
import ErrorIndicator from '../ErrorIndicator/ErrorIndicator';
import clsx from 'clsx';

interface ShareModalProps {
  shareUrl: string;
  copyState: boolean;
  isLoading: boolean;
  isError: boolean;
  onRefetch: () => void;
  onCopyClicked: () => void;
}

export default function ShareModal({
  shareUrl,
  copyState,
  isLoading,
  isError,
  onRefetch,
  onCopyClicked,
}: ShareModalProps) {
  // If error, print error message and let user be able to retry
  if (isError) {
    return (
      <div className="flex w-[500px] flex-col items-center justify-center space-y-10 p-[40px]">
        <ErrorIndicator onClickRetry={() => onRefetch()}>
          QR 코드를 불러오지 못했어요...<br></br>다시 시도하시겠어요?
        </ErrorIndicator>
      </div>
    );
  }

  // If no error or on loading, print modal contents
  return (
    <div className="flex w-[500px] flex-col items-center justify-center space-y-10 p-[40px]">
      <div className="relative flex size-[290px] items-center justify-center rounded-2xl">
        {/* This component appears to tell the user that URL is succefully copied to clipboard. */}
        {/* It will disappear after 3 seconds. */}
        {copyState && (
          <div className="absolute flex size-full rounded-2xl">
            <div className="absolute z-10 size-full rounded-2xl bg-default-black opacity-80" />
            <div className="absolute z-20 flex size-full flex-col items-center justify-center space-y-4  p-[30px] text-default-white">
              <IoShareOutline className="size-[120px]" />
              <p className="whitespace-nowrap text-center text-[20px]">
                링크가 클립보드에 복사됨
              </p>
            </div>
          </div>
        )}

        {/* QR code is here. */}
        {/* If QR code is not prepared because response is not arrived, spinner will be shown. */}
        <div className="m-[50px] flex size-full items-center justify-center">
          {isLoading && (
            <LoadingSpinner
              strokeWidth={3}
              size={'size-24'}
              color={'text-default-disabled/hover'}
            />
          )}
          {!isLoading && (
            <QRCodeSVG
              value={shareUrl}
              bgColor="#f6f5f4"
              className="size-full"
            />
          )}
        </div>
      </div>

      {/* Button that copies URL to the user's clipboard. */}
      <button
        // className="button enabled brand flex w-[360px] items-center justify-center gap-[12px] rounded-full"
        // className={`button ${!isLoading ? 'enabled' : 'disabled'} relative flex h-[64px] w-[360px] items-center px-5`}
        className={clsx(
          'flex w-[360px] items-center justify-center gap-[12px] rounded-full',
          {
            'button disabled': isLoading,
            'button enabled brand': !isLoading,
          },
        )}
        disabled={isLoading}
        onClick={() => {
          if (!isLoading) {
            onCopyClicked();
          }
        }}
      >
        <IoLinkOutline className="size-[24px]" />
        <p>{isLoading ? '링크 준비 중' : '공유 링크 복사'}</p>
      </button>
    </div>
  );
}
