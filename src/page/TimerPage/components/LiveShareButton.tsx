import { useTranslation } from 'react-i18next';
import ShareLive from '../../../components/icons/ShareLive';
import { ButtonHTMLAttributes } from 'react';

interface LiveShareButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void;
  /** 이 화면이 현재 라이브 공유 중인 사회자인지 여부. 참이면 펄스 점을 표시합니다. */
  isSharing?: boolean;
}

export default function LiveShareButton({
  onClick,
  isSharing = false,
}: LiveShareButtonProps) {
  const { t } = useTranslation();
  const label = isSharing ? t('라이브 공유 중') : t('라이브 공유');

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex aspect-square h-full items-center justify-center p-[4px]"
    >
      <div className="relative flex size-[88px] items-center justify-center rounded-full border-[2px] border-default-black2 p-[18px] shadow-lg">
        <ShareLive className="size-full" />

        {isSharing && (
          <span
            data-testid="live-share-pulse"
            aria-hidden="true"
            className="absolute right-[6px] top-[6px] flex size-[14px]"
          >
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-semantic-error opacity-75" />
            <span className="relative inline-flex size-full rounded-full border-2 border-default-white bg-semantic-error" />
          </span>
        )}
      </div>
    </button>
  );
}
