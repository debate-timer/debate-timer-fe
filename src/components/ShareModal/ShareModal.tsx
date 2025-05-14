import { QRCodeSVG } from 'qrcode.react';
import { IoLinkOutline, IoShareOutline } from 'react-icons/io5';
import LoadingSpinner from '../LoadingSpinner';

interface ShareModalProps {
  shareUrl: string;
  copyState: boolean;
  isUrlReady: boolean;
  onClick: () => void;
}

export default function ShareModal({
  shareUrl,
  copyState,
  isUrlReady,
  onClick,
}: ShareModalProps) {
  return (
    <div className="flex w-[500px] flex-col items-center justify-center space-y-10 p-[40px]">
      <div
        className="relative flex size-[290px] items-center justify-center rounded-2xl"
        style={{ boxShadow: 'inset 0 4px 8px rgba(0, 0, 0, 0.10)' }}
      >
        {/* This component appears to tell the user that URL is succefully copied to clipboard. */}
        {/* It will disappear after 3 seconds. */}
        {copyState && (
          <div className="absolute flex size-full rounded-2xl">
            <div className="absolute z-10 size-full rounded-2xl bg-neutral-900 opacity-80" />
            <div className="absolute z-20 flex size-full flex-col items-center justify-center space-y-4  p-[30px] text-neutral-50">
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
          {isUrlReady && (
            <QRCodeSVG
              value={shareUrl}
              bgColor="#f6f5f4"
              className="size-full"
            />
          )}
          {!isUrlReady && (
            <LoadingSpinner
              strokeWidth={3}
              size={'size-24'}
              color={'text-neutral-300'}
            />
          )}
        </div>
      </div>

      {/* Button that copies URL to the user's clipboard. */}
      <button
        className="button enabled relative flex h-[64px] w-[360px] items-center px-5"
        onClick={() => {
          onClick();
        }}
      >
        <p className="absolute left-1/2 -translate-x-1/2 transform text-[28px] font-bold">
          초대 링크 복사
        </p>
        <IoLinkOutline className="ml-auto size-8" />
      </button>
    </div>
  );
}
