import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { IoLinkOutline } from 'react-icons/io5';
import { copyToClipboard } from '../../../util/clipboard';

const COPY_FEEDBACK_DURATION_MS = 2000;

type CopyStatus = 'idle' | 'copied' | 'failed';

interface LiveShareQrPanelProps {
  shareUrl: string;
  titleId: string;
}

/** 실시간 공유 링크를 휴대폰 카메라로 열 수 있는 QR 코드와 링크 복사 버튼을 표시함. 창의 열고 닫기는 부모가 소유함. */
export default function LiveShareQrPanel({
  shareUrl,
  titleId,
}: LiveShareQrPanelProps) {
  const { t } = useTranslation();
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const copyFeedbackTimerRef = useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);
  const copyRequestIdRef = useRef(0);

  useEffect(() => {
    return () => clearTimeout(copyFeedbackTimerRef.current);
  }, []);

  const handleCopyLink = async () => {
    // 연속 클릭 시 늦게 끝난 이전 복사 결과가 최신 결과를 덮어쓰지 않도록 합니다.
    const requestId = ++copyRequestIdRef.current;
    clearTimeout(copyFeedbackTimerRef.current);

    const isCopied = await copyToClipboard(shareUrl);
    if (requestId !== copyRequestIdRef.current) {
      return;
    }
    setCopyStatus(isCopied ? 'copied' : 'failed');

    copyFeedbackTimerRef.current = setTimeout(() => {
      setCopyStatus('idle');
    }, COPY_FEEDBACK_DURATION_MS);
  };

  const copyButtonLabel = {
    idle: t('링크 복사'),
    copied: t('링크 복사됨'),
    failed: t('링크 복사 실패'),
  }[copyStatus];

  return (
    <div className="flex w-[min(360px,calc(100vw-32px))] flex-col items-center gap-5 p-6 text-ui-body text-neutral-900">
      <h2 id={titleId} className="text-ui-title">
        {t('토론 타이머 화면 공유')}
      </h2>
      <QRCodeSVG
        value={shareUrl}
        bgColor="#f6f5f4"
        className="size-[180px]"
        aria-label={t('실시간 공유 QR 코드')}
        role="img"
      />
      <p className="text-center text-ui-caption text-neutral-700">
        {t(
          '휴대폰 카메라로 QR 코드를 스캔하면 토론 타이머 화면이 자동으로 열립니다.',
        )}
      </p>
      <button
        type="button"
        onClick={() => void handleCopyLink()}
        aria-live="polite"
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand px-4 py-2 text-ui-label hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <IoLinkOutline className="size-[18px]" aria-hidden />
        {copyButtonLabel}
      </button>
    </div>
  );
}
