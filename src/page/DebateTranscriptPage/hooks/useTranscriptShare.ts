import { useEffect, useState } from 'react';
import { useModal } from '../../../hooks/useModal';
import usePostTranscriptShare from '../../../hooks/mutations/usePostTranscriptShare';
import useDeleteTranscriptShare from '../../../hooks/mutations/useDeleteTranscriptShare';
import { copyToClipboard } from '../../../util/clipboard';
import { createTranscriptShareUrl } from '../../../util/transcriptShare';

const COPY_INDICATOR_DURATION_MS = 3000;

// 공유 모달을 열 때 공유 링크를 발급하고, 링크 복사와 공유 해제를 다룬다.
export default function useTranscriptShare(transcriptId: number) {
  const { openModal, closeModal, ModalWrapper } = useModal();
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const {
    mutate: share,
    isPending: isSharing,
    isError: isShareError,
  } = usePostTranscriptShare(setShareToken);
  const {
    mutate: unshare,
    reset: resetUnshare,
    isPending: isUnsharing,
    isError: isUnshareError,
  } = useDeleteTranscriptShare(() => {
    setShareToken(null);
    closeModal();
  });
  const shareUrl = shareToken
    ? createTranscriptShareUrl(import.meta.env.VITE_SHARE_BASE_URL, shareToken)
    : '';

  // 복사 완료 표시는 잠시 보여준 뒤 감춘다.
  useEffect(() => {
    if (!isCopied) {
      return;
    }
    const timer = setTimeout(
      () => setIsCopied(false),
      COPY_INDICATOR_DURATION_MS,
    );
    return () => clearTimeout(timer);
  }, [isCopied]);

  // 이미 공유 중이면 서버가 기존 토큰을 돌려주므로 열 때마다 요청해도 링크가 바뀌지 않는다.
  // 발급과 해제가 엇갈려 늦은 발급이 공유를 되살리지 않도록, 해제 중에는 발급하지 않고
  // 발급 응답을 받기 전에는 이전 링크를 지워 해제를 막는다.
  const handleOpenShare = () => {
    if (isUnsharing) {
      return;
    }
    setShareToken(null);
    resetUnshare();
    openModal();
    share(transcriptId);
  };

  const handleUnshare = () => {
    if (isSharing || !shareToken) {
      return;
    }
    unshare(transcriptId);
  };

  const handleCopy = async () => {
    if (!shareUrl) {
      return;
    }
    setIsCopied(await copyToClipboard(shareUrl));
  };

  return {
    ModalWrapper,
    shareUrl,
    isCopied,
    // 링크를 받기 전까지는 준비 중으로 보여준다.
    isShareLoading: isSharing || (!shareToken && !isShareError),
    isShareError,
    isUnsharing,
    isUnshareError,
    handleOpenShare,
    handleRetryShare: () => share(transcriptId),
    handleCopy,
    handleUnshare,
  };
}
