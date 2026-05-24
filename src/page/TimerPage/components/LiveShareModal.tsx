import { ComponentType, ReactNode, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import useGetChairmanToken from '../../../hooks/query/useGetChairmanToken';
import useChairmanSocket from '../../../hooks/sockets/useChairmanSocket';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface LiveShareModalProps {
  Wrapper: ComponentType<{ children: ReactNode }>;
  tableId: number;
  isOpen: boolean;
}

export default function LiveShareModal({
  Wrapper,
  tableId,
  isOpen,
}: LiveShareModalProps) {
  const { t } = useTranslation();
  const hasConnectedRef = useRef(false);
  const isValidTableId = Number.isFinite(tableId) && tableId > 0;
  const {
    data: chairmanToken,
    isPending: isTokenPending,
    isError: isTokenError,
  } = useGetChairmanToken(String(tableId), isOpen && isValidTableId);
  const {
    connect,
    disconnect,
    isConnected: isSocketConnected,
    error: socketError,
  } = useChairmanSocket(tableId);
  const shareUrl = useMemo(
    () => `${window.location.origin}/live/${tableId}`,
    [tableId],
  );

  useEffect(
    function connectLiveShareSocket() {
      if (!isOpen || !chairmanToken || socketError || hasConnectedRef.current) {
        return;
      }

      connect();
      hasConnectedRef.current = true;
    },
    [chairmanToken, connect, isOpen, socketError],
  );

  useEffect(
    function registerLiveShareSocketCleanup() {
      return function disconnectLiveShareSocketOnUnmount() {
        if (hasConnectedRef.current) {
          disconnect();
        }
      };
    },
    [disconnect],
  );

  const isLoading =
    isOpen &&
    isValidTableId &&
    !isTokenError &&
    !socketError &&
    (isTokenPending || Boolean(chairmanToken) || hasConnectedRef.current) &&
    !isSocketConnected;
  const isError = !isValidTableId || isTokenError || Boolean(socketError);
  const errorMessage =
    !isValidTableId || isTokenError
      ? t('사회자 인증 토큰 발급에 실패했어요...')
      : t('라이브 서버 연결에 실패했어요...');

  return (
    <Wrapper>
      <div className="flex h-[250px] w-[300px] flex-col items-center justify-between p-6">
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
            <h1 className="text-lg font-bold">
              {isError ? t('라이브 공유 불가') : t('토론 타이머 화면 공유')}
            </h1>

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
    </Wrapper>
  );
}
