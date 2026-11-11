import { useTranslation } from 'react-i18next';
import ShareModal from '../../../components/ShareModal/ShareModal';

interface TranscriptShareModalProps {
  shareUrl: string;
  isCopied: boolean;
  isLoading: boolean;
  isError: boolean;
  isUnsharing: boolean;
  onRetry: () => void;
  onCopy: () => void;
  onUnshare: () => void;
}

// 시간표 공유와 같은 QR·링크 복사 모달에 공유 범위 안내와 공유 중지 버튼을 더한다.
export default function TranscriptShareModal(props: TranscriptShareModalProps) {
  const {
    shareUrl,
    isCopied,
    isLoading,
    isError,
    isUnsharing,
    onRetry,
    onCopy,
    onUnshare,
  } = props;
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center">
      <ShareModal
        shareUrl={shareUrl}
        copyState={isCopied}
        isLoading={isLoading}
        isError={isError}
        onRefetch={onRetry}
        onCopyClicked={onCopy}
      />
      {!isError && (
        <div className="-mt-4 flex w-[500px] flex-col items-center gap-3 px-10 pb-10">
          <p className="text-center text-ui-caption text-neutral-500">
            {t('링크가 있는 사람은 누구나 로그인 없이 이 기록을 볼 수 있어요.')}
          </p>
          <button
            type="button"
            aria-label={t('공유 중지')}
            disabled={isLoading || isUnsharing}
            onClick={onUnshare}
            className="text-ui-label text-red-600 underline disabled:opacity-40"
          >
            {t('공유 중지')}
          </button>
        </div>
      )}
    </div>
  );
}
