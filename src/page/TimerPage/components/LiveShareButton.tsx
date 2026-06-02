import { useTranslation } from 'react-i18next';
import ShareLive from '../../../components/icons/ShareLive';
import { ButtonHTMLAttributes } from 'react';

interface LiveShareButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void;
}

export default function LiveShareButton({ onClick }: LiveShareButtonProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t('라이브 공유')}
      title={t('라이브 공유')}
      className="flex aspect-square h-full items-center justify-center p-[4px]"
    >
      <div className="flex size-[88px] items-center justify-center rounded-full border-[2px] border-default-black2 p-[18px] shadow-lg">
        <ShareLive className="size-full" />
      </div>
    </button>
  );
}
