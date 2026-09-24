import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { socketManager } from '../../../apis/sockets/SocketManager';
import useChairmanSocket from '../../../hooks/sockets/useChairmanSocket';
import useGetChairmanToken from '../../../hooks/query/useGetChairmanToken';
import { SocketEventType, TimerDataPayload } from '../../../apis/sockets/type';

/**
 * 라이브 공유 오류 유형
 * - `token`: 사회자 토큰 발급 실패 또는 잘못된 테이블
 * - `replaced`: 다른 탭/기기에서 공유를 시작해 이 화면의 공유가 멈춤
 * - `else`: 그 밖의 소켓 연결 오류
 */
export type LiveShareErrorType = 'token' | 'replaced' | 'else';

interface UseLiveShareOptions {
  /** 서버가 현재 타이머 상태 공유를 요청했을 때 호출됩니다. */
  onSyncRequest?: () => void;
}

export function useLiveShare(
  tableId: number,
  options: UseLiveShareOptions = {},
) {
  const { onSyncRequest } = options;
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
    isReplaced,
    sendDebateEvent,
    error: socketError,
  } = useChairmanSocket(tableId, { onSyncRequest });

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
    !isReplaced &&
    (isTokenPending || Boolean(chairmanToken)) &&
    !isSocketConnected;
  const isError =
    !isValidTableId || isTokenError || Boolean(socketError) || isReplaced;
  let errorType: LiveShareErrorType = 'else';
  if (!isValidTableId || isTokenError) {
    errorType = 'token';
  } else if (isReplaced) {
    errorType = 'replaced';
  }

  // 토큰을 첨부하여 토론 이벤트를 전송하는 함수
  const issueEvent = useCallback(
    (eventType: SocketEventType, payload: TimerDataPayload | null) => {
      sendDebateEvent(eventType, payload, chairmanToken ?? '');
    },
    [chairmanToken, sendDebateEvent],
  );

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
        hasConnectedRef.current = false;

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
   * 다른 탭/기기에 밀려난 상태에서는 발행 권한을 다시 뺏어오지 않도록 자동으로 연결하지 않는다
   */
  useEffect(
    function connectLiveShareSocket() {
      if (
        !isLiveShareModalOpen ||
        !chairmanToken ||
        socketError ||
        isReplaced ||
        hasConnectedRef.current
      ) {
        return;
      }

      connect();
      hasConnectedRef.current = true;
    },
    [chairmanToken, connect, isLiveShareModalOpen, isReplaced, socketError],
  );

  /**
   * 다른 탭/기기에 밀려나면 사용자가 알 수 있도록 공유 모달을 연다
   */
  useEffect(
    function openModalOnReplaced() {
      if (isReplaced) {
        setIsLiveShareModalOpen(true);
      }
    },
    [isReplaced],
  );

  /**
   * 밀려난 뒤 사용자가 이 화면에서 공유를 다시 시작한다
   * 새 사회자 세션으로 연결하므로 이 화면이 다시 최신 사회자가 된다
   */
  const restartLiveShare = useCallback(() => {
    if (!chairmanToken) {
      return;
    }

    connect();
    hasConnectedRef.current = true;
  }, [chairmanToken, connect]);

  /**
   * 오류 발생 시 연결 해제 및 상태 초기화 (정리)
   */
  useEffect(
    function cleanupOnError() {
      if (!isError) {
        return;
      }

      hasConnectedRef.current = false;

      // 밀려난 경우 이미 연결을 끊었고, 이 화면에서 다시 공유할 수 있도록 토큰은 유지한다
      if (isReplaced) {
        return;
      }

      disconnect();
    },
    [isError, isReplaced, disconnect],
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
    restartLiveShare,
  };
}
