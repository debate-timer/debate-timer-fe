import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { socketManager } from '../../../apis/sockets/SocketManager';
import useChairmanSocket from '../../../hooks/sockets/useChairmanSocket';
import useGetChairmanToken from '../../../hooks/query/useGetChairmanToken';
import { SocketEventType, TimerDataPayload } from '../../../apis/sockets/type';

export type LiveShareErrorType = 'token' | 'else';

export function useLiveShare(tableId: number) {
  // 테이블 ID 검증
  const isValidTableId = Number.isFinite(tableId) && tableId > 0;

  // 모달 공유 관련
  const hasConnectedRef = useRef(false);
  const [isLiveShareModalOpen, setIsLiveShareModalOpen] = useState(false);
  const toggleLiveShareModal = useCallback(() => {
    setIsLiveShareModalOpen((prev) => !prev);
  }, []);

  // 사회자 임시 토큰 발급 훅
  const {
    data: chairmanToken,
    isPending: isTokenPending,
    isError: isTokenError,
  } = useGetChairmanToken(
    String(tableId),
    isLiveShareModalOpen && isValidTableId,
  );

  // 소켓 훅
  const {
    connect,
    disconnect,
    isConnected: isSocketConnected,
    sendDebateEvent,
    error: socketError,
  } = useChairmanSocket(tableId);

  // 공유용 URL
  const shareUrl = useMemo(() => {
    const baseUrl =
      import.meta.env.VITE_SHARE_BASE_URL || window.location.origin;
    const normalizedBaseUrl = baseUrl.endsWith('/')
      ? baseUrl.slice(0, -1)
      : baseUrl;
    return `${normalizedBaseUrl}/live/${tableId}`;
  }, [tableId]);

  // 모달 바깥 영역에서의 클릭을 처리하기 위한 레퍼런스와 함수
  const liveShareModalRef = useRef<HTMLDivElement>(null);

  // 반환용 값들
  const isLoading =
    isLiveShareModalOpen &&
    isValidTableId &&
    !isTokenError &&
    !socketError &&
    (isTokenPending || Boolean(chairmanToken)) &&
    !isSocketConnected;
  const isError = !isValidTableId || isTokenError || Boolean(socketError);
  const errorType: LiveShareErrorType =
    !isValidTableId || isTokenError ? 'token' : 'else';

  // 토큰을 첨부하여 토론 이벤트를 전송하는 함수
  const issueEvent = (
    eventType: SocketEventType,
    payload: TimerDataPayload | null,
  ) => {
    sendDebateEvent(eventType, payload, chairmanToken ?? '');
  };

  /**
   * 토론 공유 모달 바깥 클릭을 처리하는 부수 효과
   */
  useEffect(
    function handleClickOutsideModal() {
      const handle = (event: MouseEvent) => {
        if (
          liveShareModalRef.current &&
          !liveShareModalRef.current.contains(event.target as Node) &&
          isLiveShareModalOpen
        ) {
          toggleLiveShareModal();
        }
      };
      document.addEventListener('mousedown', handle);
      return () => {
        document.removeEventListener('mousedown', handle);
      };
    },
    [isLiveShareModalOpen, toggleLiveShareModal],
  );

  /**
   * 만약 소켓 사용 중이라면 타이머 페이지가 언마운트될 때 같이 닫음
   */
  useEffect(
    function closeSocketOnUnmount() {
      return () => {
        // 훅 레벨에서 먼저 소켓 닫기
        disconnect();

        // 그리고 싱글톤 인스턴스 레벨에서 완전히 닫기
        // 현재로서는 사회자가 소켓을 사용하는 기능이 이거 말고 없기 때문에
        // 싱글톤 인스턴스도 여기서 닫아도 다른 기능에 방해를 주지 않음
        if (socketManager.isConnected()) {
          socketManager.disconnect();
        }
      };
    },
    [disconnect],
  );

  /**
   * 모달이 열렸을 시, 소켓 연결을 시도하는 부수 효과
   */
  useEffect(
    function connectLiveShareSocket() {
      if (
        !isLiveShareModalOpen ||
        !chairmanToken ||
        socketError ||
        hasConnectedRef.current
      ) {
        return;
      }

      connect();
      hasConnectedRef.current = true;
    },
    [chairmanToken, connect, isLiveShareModalOpen, socketError],
  );

  return {
    isLiveShareModalOpen,
    toggleLiveShareModal,
    liveShareModalRef,
    issueEvent,
    connect,
    disconnect,
    shareUrl,
    isLoading,
    isError,
    errorType,
    isSocketConnected,
  };
}
