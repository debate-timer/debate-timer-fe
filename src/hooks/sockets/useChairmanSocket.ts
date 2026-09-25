import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { IMessage } from '@stomp/stompjs';
import {
  CHAIRMAN_SESSION_HEADER,
  SocketEventType,
  SocketMessage,
  TimerDataPayload,
} from '../../apis/sockets/type';
import { socketManager } from '../../apis/sockets/SocketManager';
import { isChairmanNotice, isTimerEventType } from '../../apis/sockets/util';
import useDocumentVisibility from '../useDocumentVisibility';
import { chairmanTokenQueryKey } from '../query/useGetChairmanToken';
import useSocket from './useSocket';

// 청중이 사회자 연결 여부를 판단할 수 있도록 현재 상태를 주기적으로 공유하는 간격
export const CHAIRMAN_HEARTBEAT_INTERVAL_MS = 5000;

// 탭이 돌아왔을 때 상태 공유를 다시 시도하는 최소 간격
const VISIBILITY_SYNC_THROTTLE_MS = 1000;

/**
 * 공유를 시작할 때마다 새 사회자 세션 식별자를 만든다.
 * `crypto.randomUUID`는 보안 컨텍스트(HTTPS)에서만 제공되므로 없으면 시각과 난수로 대신한다.
 */
export function createChairmanSessionId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function parseMessageBody(message: IMessage): unknown {
  try {
    return JSON.parse(message.body);
  } catch {
    return null;
  }
}

/**
 * 사회자 전용 웹소켓 훅입니다.
 *
 * * ⚠️ 주의: 이 훅을 컴포넌트에서 호출하여 페이지가 마운트(렌더링)되는 순간,
 * 내부의 `useEffect`가 실행되어 즉시 `/chairman/{roomId}` 채널에 대한 구독(Subscribe)을 요청합니다.
 * 컴포넌트가 언마운트되면 해당 채널의 구독은 자동으로 해제됩니다.
 * * 사회자는 데이터를 수신할 뿐만 아니라, `sendModeratorAction`을 통해
 * 특정 제어 메시지를 지정된 채널로 송신(Publish)할 수 있습니다.
 *
 * @param {number} roomId - 관리할 토론방의 고유 ID
 * @param {UseChairmanSocketOptions} options - 서버의 상태 공유 요청을 처리할 콜백 옵션
 * @returns {Object} 사회자 소켓 상태와 제어 함수를 반환합니다.
 * @returns {number} returns.signalCount - 현재 소켓 세션에서 수신한 신호 수입니다.
 * @returns {number | null} returns.lastSignalTime - 현재 소켓 세션에서 마지막으로 신호를 수신한 시각의 타임스탬프입니다.
 * @returns {Function} returns.connect - `useSocket.connect`에 위임하기 전에 현재 신호 상태를 초기화합니다.
 * @returns {Function} returns.disconnect - `useSocket.disconnect`에 위임하기 전에 현재 신호 상태를 초기화합니다.
 * @returns {Function} returns.sendDebateEvent - 현재 방으로 사회자 토론 이벤트를 발행합니다.
 * @returns {boolean} returns.isReplaced - 다른 탭/기기에서 공유를 시작해 이 세션이 발행 권한을 잃었는지 여부입니다.
 * @returns {Error | null} returns.error - 가장 최근에 발생한 소켓 오류입니다.
 */
interface UseChairmanSocketOptions {
  /**
   * 소켓이 연결(재연결 포함)되거나, 서버가 `/chairman/{roomId}`로 현재 상태 공유를 요청했을 때 호출됩니다.
   * 연결된 동안에는 heartbeat로 `CHAIRMAN_HEARTBEAT_INTERVAL_MS`마다 호출됩니다.
   */
  onSyncRequest?: () => void;

  /**
   * 사회자 채널을 구독할 때 첨부할 사회자 토큰을 반환합니다.
   * 서버는 유효한 사회자 토큰을 가진 테이블 소유자의 구독만 허용합니다.
   * 재연결 후 다시 구독할 때마다 호출되므로 갱신된 토큰이 첨부됩니다.
   */
  getAuthToken?: () => string | null | undefined;
}

export default function useChairmanSocket(
  roomId: number,
  options: UseChairmanSocketOptions = {},
) {
  const { onSyncRequest, getAuthToken } = options;
  const queryClient = useQueryClient();
  const {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    publish,
    addConnectionListener,
    isConnected,
    error,
  } = useSocket();

  const [signalCount, setSignalCount] = useState<number>(0);
  const [lastSignalTime, setLastSignalTime] = useState<number | null>(null);

  // 다른 사회자 세션이 활성 사회자가 되어 이 세션이 밀려났는지 여부
  const [isReplaced, setIsReplaced] = useState<boolean>(false);

  // 서버가 룸의 활성 사회자를 구분하는 식별자
  // 공유를 시작(connect)할 때마다 새로 만들고, 같은 공유 중 자동 재연결에서는 유지한다
  const chairmanSessionIdRef = useRef<string>(createChairmanSessionId());

  // 구독을 다시 맺지 않고도 최신 콜백을 호출하기 위해 ref로 보관
  const onSyncRequestRef = useRef(onSyncRequest);
  useEffect(() => {
    onSyncRequestRef.current = onSyncRequest;
  }, [onSyncRequest]);

  const getAuthTokenRef = useRef(getAuthToken);
  useEffect(() => {
    getAuthTokenRef.current = getAuthToken;
  }, [getAuthToken]);

  // 마지막으로 발행한 이벤트의 version
  const versionRef = useRef(0);

  // 사용자가 공유를 시작했는지 여부 (탭 복귀 시 자동 재연결 여부를 가른다)
  const hasStartedSharingRef = useRef(false);

  /**
   * 현재 사회자 소켓 세션에서 누적된 신호 메타데이터를 초기화합니다.
   * 세션 간에 오래된 신호 수나 타임스탬프가 남지 않도록, 래핑된 connect 및
   * disconnect 제어 함수에서 사용하는 초기화 동작을 한곳에 모읍니다.
   */
  const resetSignalState = useCallback(() => {
    setSignalCount(0);
    setLastSignalTime(null);
  }, []);

  /**
   * 이전에 수신한 신호 상태를 초기화한 뒤 사회자 소켓을 시작합니다.
   * 새 연결이 이전 세션의 신호 수나 마지막 신호 타임스탬프 없이 시작되도록
   * `useSocket.connect`를 래핑합니다.
   */
  const connectChairmanSocket = useCallback(
    (options?: Parameters<typeof connect>[0]) => {
      resetSignalState();
      chairmanSessionIdRef.current = createChairmanSessionId();
      setIsReplaced(false);
      hasStartedSharingRef.current = true;
      connect(options);
    },
    [connect, resetSignalState],
  );

  /**
   * 현재 신호 메타데이터를 초기화한 뒤 사회자 소켓을 종료합니다.
   * 수동으로 연결을 해제할 때도 React 상태에 남아 있을 수 있는 세션 단위 신호
   * 상태를 제거하기 위해 `useSocket.disconnect`를 래핑합니다.
   *
   * 사용자가 명시적으로 이 함수를 호출한 경우, TanStack Query에 저장된
   * 임시 액세스 토큰 캐시를 제거합니다.
   */
  const disconnectChairmanSocket = useCallback(() => {
    resetSignalState();
    hasStartedSharingRef.current = false;
    disconnect();
    queryClient.removeQueries({
      queryKey: chairmanTokenQueryKey(String(roomId)),
      exact: true,
    });
  }, [disconnect, queryClient, resetSignalState, roomId]);

  // 연결(재연결 포함) 시 이전 세션의 신호 상태를 초기화하고,
  // 서버 요청을 기다리지 않고 현재 상태를 먼저 공유한다.
  // 사회자보다 먼저 입장한 청중이 곧바로 타이머를 받고, 종료됐던 룸도 다시 열린다.
  useEffect(() => {
    return addConnectionListener(() => {
      resetSignalState();
      // 연결 리스너는 채널 재구독보다 먼저 실행되므로, 사회자 채널 구독(활성 사회자 등록)이
      // 서버에 먼저 도착하도록 재구독이 끝난 뒤에 현재 상태를 공유한다
      queueMicrotask(() => {
        onSyncRequestRef.current?.();
      });
    });
  }, [addConnectionListener, resetSignalState]);

  /**
   * 다른 사회자 세션에 밀려나면 발행을 멈추고 연결을 끊는다.
   * 자동 재연결로 발행 권한을 되찾으려 하지 않도록 수동 해제와 같은 방식으로 끊는다.
   */
  const handleReplaced = useCallback(() => {
    setIsReplaced(true);
    resetSignalState();
    hasStartedSharingRef.current = false;
    disconnect();
  }, [disconnect, resetSignalState]);

  /**
   * 백그라운드 탭에서 돌아오면 억제됐던 heartbeat를 기다리지 않고 곧바로 현재 상태를 공유한다.
   * 청중은 사회자 메시지가 끊기면 연결이 끊긴 것으로 보기 때문에, 복귀 즉시 알려야 오해가 풀린다.
   * 돌아왔을 때 연결이 이미 끊겨 있었다면 공유를 다시 시작한다.
   */
  const handleVisible = useCallback(() => {
    if (!hasStartedSharingRef.current) {
      return;
    }

    if (!socketManager.isConnected()) {
      connectChairmanSocket();
      return;
    }

    onSyncRequestRef.current?.();
  }, [connectChairmanSocket]);

  useDocumentVisibility(handleVisible, {
    throttleMs: VISIBILITY_SYNC_THROTTLE_MS,
  });

  // 서버로부터 토론 이벤트를 갱신해달라는 요청과 활성 사회자 교체 알림을 받게 될 채널 구독
  useEffect(() => {
    const destination = `/chairman/${roomId}`;

    resetSignalState();

    subscribe(
      destination,
      (message: IMessage) => {
        const notice = parseMessageBody(message);
        if (isChairmanNotice(notice) && notice.type === 'REPLACED') {
          if (notice.activeSessionId !== chairmanSessionIdRef.current) {
            handleReplaced();
          }
          return;
        }

        setSignalCount((prev) => prev + 1);
        setLastSignalTime(Date.now());
        onSyncRequestRef.current?.();
      },
      () => {
        const authToken = getAuthTokenRef.current?.();
        return {
          [CHAIRMAN_SESSION_HEADER]: chairmanSessionIdRef.current,
          ...(authToken ? { Authorization: authToken } : {}),
        };
      },
    );

    return () => {
      unsubscribe(destination);
    };
  }, [roomId, handleReplaced, resetSignalState, subscribe, unsubscribe]);

  // 연결된 동안 현재 상태를 주기적으로 공유해 청중이 사회자 연결 끊김을 감지할 수 있게 한다
  useEffect(() => {
    if (!isConnected) {
      return;
    }

    const heartbeat = setInterval(() => {
      onSyncRequestRef.current?.();
    }, CHAIRMAN_HEARTBEAT_INTERVAL_MS);

    return () => {
      clearInterval(heartbeat);
    };
  }, [isConnected]);

  useEffect(() => {
    if (!error) {
      return;
    }

    resetSignalState();
  }, [error, resetSignalState]);

  // 사회자 권한으로 특정 제어 메시지를 발행하는 함수
  const sendDebateEvent = useCallback(
    (
      eventType: SocketEventType,
      payload: TimerDataPayload | null,
      authToken: string,
    ) => {
      const destination = `/app/event/${roomId}`;
      let body: SocketMessage;

      // 사회자가 새로고침해도 이전보다 큰 값이 되도록 현재 시각을 기준으로 증가
      const version = Math.max(versionRef.current + 1, Date.now());

      if (isTimerEventType(eventType)) {
        if (payload === null) {
          console.error('No payload for timer event.');
          return;
        } else {
          body = {
            eventType,
            data: payload,
            version,
          };
        }
      } else {
        body = {
          eventType,
          data: null,
          version,
        };
      }

      versionRef.current = version;
      publish(destination, body, {
        Authorization: authToken,
        [CHAIRMAN_SESSION_HEADER]: chairmanSessionIdRef.current,
      });
    },
    [roomId, publish],
  );

  return {
    signalCount,
    lastSignalTime,
    connect: connectChairmanSocket,
    disconnect: disconnectChairmanSocket,
    sendDebateEvent,
    isConnected,
    isReplaced,
    error,
  };
}
