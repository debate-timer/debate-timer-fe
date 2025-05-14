import { QRCodeSVG } from 'qrcode.react';
import { IoLinkOutline } from 'react-icons/io5';

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
        className="size-[290px] rounded-2xl p-[50px]"
        style={{ boxShadow: 'inset 0 4px 16px rgba(0, 0, 0, 0.10)' }}
      >
        {isUrlReady && (
          <>
            <QRCodeSVG value={shareUrl} className="size-full" />
            {copyState && <></>}
          </>
        )}
        {!isUrlReady && (
          <>
            <img src="/spinner.gif" alt="Loading" />
          </>
        )}
      </div>
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
