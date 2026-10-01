import { useTranslation } from 'react-i18next';
import ShareLive from '../../../components/icons/ShareLive';
import { ButtonHTMLAttributes } from 'react';

interface LiveShareButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void;
  /** 이 화면이 현재 라이브 공유 중인 사회자인지 여부. 참이면 점이 붉게 깜빡입니다. */
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

        {/* 공유 여부를 항상 점으로 알린다. 공유 중이면 붉게 깜빡이고, 아니면 회색으로 멈춘다 */}
        <span
          data-testid={isSharing ? 'live-share-pulse' : 'live-share-idle-dot'}
          aria-hidden="true"
          className="absolute bottom-[8px] left-1/2 flex size-[12px] -translate-x-1/2"
        >
          {isSharing && (
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-semantic-error opacity-75" />
          )}
          <span
            className={`relative inline-flex size-full rounded-full border-2 border-default-white ${
              isSharing ? 'bg-semantic-error' : 'bg-default-neutral'
            }`}
          />
        </span>
      </div>
    </button>
  );
}
