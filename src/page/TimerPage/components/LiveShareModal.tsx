import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { IoLinkOutline } from 'react-icons/io5';
import LoadingSpinner from '../../../components/LoadingSpinner';
import DTClose from '../../../components/icons/Close';
import { LiveShareErrorType } from '../hooks/useLiveShare';
import { copyToClipboard } from '../../../util/clipboard';

const COPY_FEEDBACK_DURATION_MS = 2000;

type CopyStatus = 'idle' | 'copied' | 'failed';

interface LiveShareModalProps {
  shareUrl: string;
  isLoading: boolean;
  isError: boolean;
  errorType: LiveShareErrorType;
  toggleModal: () => void;
  /** 다른 탭/기기에 밀려난 뒤 이 화면에서 공유를 다시 시작합니다. */
  onRestart?: () => void;
}

export default function LiveShareModal({
  shareUrl,
  isLoading,
  isError,
  errorType,
  toggleModal,
  onRestart,
}: LiveShareModalProps) {
  const { t } = useTranslation();
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const copyFeedbackTimerRef = useRef<ReturnType<typeof setTimeout>>();
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
    idle: t('링크 공유'),
    copied: t('링크 복사됨'),
    failed: t('링크 복사 실패'),
  }[copyStatus];

  const isReplaced = errorType === 'replaced';
  const isDisconnected = errorType === 'disconnected';
  let errorTitle = t('라이브 공유 불가');
  if (isReplaced) {
    errorTitle = t('다른 곳에서 공유 중');
  } else if (isDisconnected) {
    errorTitle = t('라이브 연결 끊김');
  }
  const errorMessage = {
    token: t('사회자 인증 토큰 발급에 실패했어요...'),
    replaced: t(
      '다른 탭이나 기기에서 라이브 공유를 시작해서 이 화면의 공유를 멈췄어요.',
    ),
    disconnected: t('라이브 서버와 연결이 끊겼어요. 새로고침 해주세요.'),
    else: t('라이브 서버 연결에 실패했어요...'),
  }[errorType];

  return (
    <div
      data-testid="live-share-modal"
      className="flex h-[300px] w-[300px] flex-col items-center justify-between rounded-2xl border-2 border-default-disabled/hover bg-default-white p-6 shadow-lg"
    >
      {isLoading ? (
        <div className="flex size-full items-center justify-center">
          <LoadingSpinner
            strokeWidth={2}
            size={'size-24'}
            color={'text-default-disabled/hover'}
          />
        </div>
      ) : (
        <>
          <div className="relative flex w-full items-center justify-center">
            <h1 className="text-lg font-bold">
              {isError ? errorTitle : t('토론 타이머 화면 공유')}
            </h1>

            <button
              type="button"
              onClick={toggleModal}
              className={`absolute right-0 text-xl text-default-black`}
              aria-label={t('모달 닫기')}
              title={t('모달 닫기')}
            >
              <DTClose className="size-[16px]" />
            </button>
          </div>

          {!isError ? (
            <>
              <QRCodeSVG
                value={shareUrl}
                bgColor="#f6f5f4"
                className="size-[100px]"
              />

              <div className="flex flex-row items-center space-x-[10px]">
                <div className="h-[36px] w-[4px] bg-default-neutral" />

                <p className="text-[14px] font-medium text-default-black2">
                  {t(
                    '휴대폰 카메라로 QR 코드를 스캔하면 토론 타이머 화면이 자동으로 열립니다.',
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                aria-live="polite"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-4 py-2 text-[14px] font-semibold text-default-black transition-colors hover:bg-brand-hover"
              >
                <IoLinkOutline className="size-[18px]" aria-hidden />
                {copyButtonLabel}
              </button>
            </>
          ) : (
            <>
              <p className="text-[12px] text-default-neutral">{errorMessage}</p>

              {isReplaced && onRestart && (
                <button
                  type="button"
                  onClick={onRestart}
                  className="w-full rounded-full bg-brand px-4 py-2 text-[14px] font-semibold text-default-black transition-colors hover:bg-brand-hover"
                >
                  {t('이 화면에서 다시 공유하기')}
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
