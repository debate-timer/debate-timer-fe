import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { socketManager } from '../../../apis/sockets/SocketManager';
import useChairmanSocket from '../../../hooks/sockets/useChairmanSocket';
import useGetChairmanToken from '../../../hooks/query/useGetChairmanToken';
import { SocketEventType, TimerDataPayload } from '../../../apis/sockets/type';
import { isSocketError } from '../../../apis/sockets/error';
import {
  getAccessToken,
  getMemberId,
  getAuthRevision,
} from '../../../util/accessToken';
import { getJwtExpiresAt } from '../../../util/jwt';

// 사회자 토큰이 만료되기 이 시간 전에 새 토큰을 받아 발행이 끊기지 않게 한다
export const CHAIRMAN_TOKEN_REFRESH_BEFORE_MS = 60 * 1000;

/**
 * 라이브 공유 오류 유형
 * - `token`: 사회자 토큰 발급 실패 또는 잘못된 테이블
 * - `replaced`: 다른 탭/기기에서 공유를 시작해 이 화면의 공유가 멈춤
 * - `disconnected`: 재연결 시도를 모두 소진해 자동으로 복구되지 않음 (새로고침 필요)
 * - `else`: 그 밖의 소켓 연결 오류
 */
export type LiveShareErrorType = 'token' | 'replaced' | 'disconnected' | 'else';

interface UseLiveShareSessionOptions {
  onSyncRequest?: () => void;
  /** MP-04에서 제거할 기존 화면 호환용임. 새 소비자는 기본값을 사용함. */
  isLegacy?: boolean;
}

/** 오버레이와 독립적으로 공유 시작·로컬 중단·재연결 수명을 소유함. */
export default function useLiveShareSession(
  tableId: number,
  options: UseLiveShareSessionOptions = {},
) {
  const { onSyncRequest, isLegacy = false } = options;
  const isValidTableId = Number.isSafeInteger(tableId) && tableId > 0;
  const hasConnectedRef = useRef(false);
  const desiredRef = useRef(false);
  const [isRequested, setIsRequested] = useState(false);
  const [hasStopError, setHasStopError] = useState(false);
  const [connectionError, setConnectionError] =
    useState<LiveShareErrorType | null>(null);
  const startSharing = useCallback(() => {
    desiredRef.current = true;
    setHasStopError(false);
    setConnectionError(null);
    setIsRequested(true);
  }, []);

  // 사회자 임시 토큰 발급 훅
  const {
    data: chairmanToken,
    isPending: isTokenPending,
    isError: isTokenError,
    refetch: refetchChairmanToken,
  } = useGetChairmanToken(
    String(tableId),
    isRequested && isValidTableId,
    isLegacy
      ? undefined
      : {
          memberId: getAccessToken() ? getMemberId() : null,
          revision: getAuthRevision(),
        },
  );

  // 사회자 채널을 (재)구독할 때 최신 사회자 토큰을 첨부하기 위해 ref로 보관
  const chairmanTokenRef = useRef(chairmanToken);
  useEffect(() => {
    chairmanTokenRef.current = chairmanToken;
  }, [chairmanToken]);
  const getAuthToken = useCallback(() => chairmanTokenRef.current, []);

  // 소켓 훅
  const {
    connect,
    disconnect,
    isConnected: isSocketConnected,
    isReplaced,
    sendDebateEvent,
    error: socketError,
  } = useChairmanSocket(tableId, {
    onSyncRequest: () => {
      if (desiredRef.current || isLegacy) {
        onSyncRequest?.();
      }
    },
    getAuthToken,
    enabled: isRequested || isLegacy,
  });

  // 공유용 URL
  const shareUrl = useMemo(() => {
    const baseUrl =
      import.meta.env.VITE_SHARE_BASE_URL || window.location.origin;
    const normalizedBaseUrl = baseUrl.endsWith('/')
      ? baseUrl.slice(0, -1)
      : baseUrl;
    return `${normalizedBaseUrl}/live/${tableId}`;
  }, [tableId]);

  // 반환용 값들
  const isLoading =
    isRequested &&
    isValidTableId &&
    !isTokenError &&
    !socketError &&
    !connectionError &&
    !isReplaced &&
    (isTokenPending || Boolean(chairmanToken)) &&
    !isSocketConnected;
  const isError =
    ((isRequested || isLegacy) &&
      (!isValidTableId ||
        isTokenError ||
        Boolean(socketError) ||
        isReplaced)) ||
    hasStopError ||
    connectionError !== null;
  let errorType: LiveShareErrorType = connectionError ?? 'else';
  if (!isValidTableId || isTokenError) {
    errorType = 'token';
  } else if (isReplaced) {
    errorType = 'replaced';
  } else if (
    isSocketError(socketError) &&
    socketError.code === 'SOCKET_RETRY_EXHAUSTED'
  ) {
    errorType = 'disconnected';
  }

  // 토큰을 첨부하여 토론 이벤트를 전송하는 함수
  // 기기가 절전 상태였다가 깨어나는 등 갱신 시점을 놓쳐 토큰이 만료됐다면 곧바로 새 토큰을 요청한다
  // (이번 이벤트는 거부될 수 있지만, 새 토큰을 받은 뒤 heartbeat가 현재 상태를 다시 공유한다)
  const issueEvent = useCallback(
    (eventType: SocketEventType, payload: TimerDataPayload | null) => {
      const expiresAt = chairmanToken ? getJwtExpiresAt(chairmanToken) : null;
      if (
        eventType !== 'ABORT' &&
        expiresAt !== null &&
        expiresAt <= Date.now()
      ) {
        void refetchChairmanToken();
      }

      return sendDebateEvent(eventType, payload, chairmanToken ?? '');
    },
    [chairmanToken, refetchChairmanToken, sendDebateEvent],
  );

  /**
   * 공유 중에는 사회자 토큰이 만료되기 전에 새 토큰을 받아둔다
   * 토론이 예상보다 길어져 토큰 유효시간을 넘겨도 발행이 끊기지 않게 한다
   */
  useEffect(
    function refreshChairmanTokenBeforeExpiry() {
      if (!isSocketConnected || !chairmanToken) {
        return;
      }

      const expiresAt = getJwtExpiresAt(chairmanToken);
      if (expiresAt === null) {
        return;
      }

      const refreshTimeout = setTimeout(
        () => {
          void refetchChairmanToken();
        },
        Math.max(expiresAt - CHAIRMAN_TOKEN_REFRESH_BEFORE_MS - Date.now(), 0),
      );

      return () => {
        clearTimeout(refreshTimeout);
      };
    },
    [chairmanToken, isSocketConnected, refetchChairmanToken],
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
   * 확인 후 시작 요청이 유효할 때만 소켓 연결을 시도함
   * 다른 탭/기기에 밀려난 상태에서는 발행 권한을 다시 뺏어오지 않도록 자동으로 연결하지 않는다
   */
  useEffect(
    function connectLiveShareSocket() {
      if (
        !isRequested ||
        !desiredRef.current ||
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
    [chairmanToken, connect, isRequested, isReplaced, socketError],
  );

  /**
   * 밀려난 뒤 사용자가 이 화면에서 공유를 다시 시작한다
   * 새 사회자 세션으로 연결하므로 이 화면이 다시 최신 사회자가 된다
   */
  const restartLiveShare = useCallback(() => {
    if (!chairmanToken) {
      startSharing();
      void refetchChairmanToken();
      return;
    }

    desiredRef.current = true;
    setIsRequested(true);
    setHasStopError(false);
    setConnectionError(null);
    connect();
    hasConnectedRef.current = true;
  }, [chairmanToken, connect, refetchChairmanToken, startSharing]);

  /**
   * 오류 발생 시 연결 해제 및 상태 초기화 (정리)
   */
  useEffect(
    function cleanupOnError() {
      if (!isError) {
        return;
      }

      hasConnectedRef.current = false;
      if (socketError || isTokenError || isReplaced) {
        desiredRef.current = false;
        setConnectionError(errorType);
      }

      // 밀려난 경우 이미 연결을 끊었고, 이 화면에서 다시 공유할 수 있도록 토큰은 유지한다
      if (isReplaced) {
        return;
      }

      disconnect();
    },
    [isError, isReplaced, socketError, isTokenError, errorType, disconnect],
  );

  const stopSharing = useCallback(() => {
    const hadStarted = hasConnectedRef.current;
    desiredRef.current = false;
    setIsRequested(false);
    hasConnectedRef.current = false;
    let didPublish = false;
    try {
      if (isSocketConnected && !isReplaced) {
        didPublish = issueEvent('ABORT', null) === true;
      }
    } catch {
      /* 서버 성공 확인과 구분해 로컬 발행 오류로 남김. */
    } finally {
      disconnect();
    }
    setConnectionError(null);
    setHasStopError(hadStarted && !didPublish);
    return didPublish;
  }, [disconnect, isReplaced, isSocketConnected, issueEvent]);

  return {
    startSharing,
    stopSharing,
    isRequested,
    isReplaced,
    isSharing: isRequested && isSocketConnected && !isError,
    hasStopError,
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
