import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import LoadingSpinner from '../../../components/LoadingSpinner';
import DTClose from '../../../components/icons/Close';
import { LiveShareErrorType } from '../hooks/useLiveShare';

interface LiveShareModalProps {
  shareUrl: string;
  isLoading: boolean;
  isError: boolean;
  errorType: LiveShareErrorType;
  toggleModal: () => void;
}

export default function LiveShareModal({
  shareUrl,
  isLoading,
  isError,
  errorType,
  toggleModal,
}: LiveShareModalProps) {
  const { t } = useTranslation();
  const errorMessage =
    errorType == 'token'
      ? t('사회자 인증 토큰 발급에 실패했어요...')
      : t('라이브 서버 연결에 실패했어요...');

  return (
    <div className="flex h-[250px] w-[300px] flex-col items-center justify-between rounded-2xl border-2 border-default-disabled/hover p-6">
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
              {isError ? t('라이브 공유 불가') : t('토론 타이머 화면 공유')}
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
            </>
          ) : (
            <p className="text-[12px] text-default-neutral">{errorMessage}</p>
          )}
        </>
      )}
    </div>
  );
}
