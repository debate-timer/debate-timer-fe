import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  SocketEventType,
  SocketMessage,
  TimerDataPayload,
} from '../../apis/sockets/type';
import { isTimerEventType } from '../../apis/sockets/util';
import { chairmanTokenQueryKey } from '../query/useGetChairmanToken';
import useSocket from './useSocket';

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
 * @returns {Object} 사회자 소켓 상태와 제어 함수를 반환합니다.
 * @returns {number} returns.signalCount - 현재 소켓 세션에서 수신한 신호 수입니다.
 * @returns {number | null} returns.lastSignalTime - 현재 소켓 세션에서 마지막으로 신호를 수신한 시각의 타임스탬프입니다.
 * @returns {Function} returns.connect - `useSocket.connect`에 위임하기 전에 현재 신호 상태를 초기화합니다.
 * @returns {Function} returns.disconnect - `useSocket.disconnect`에 위임하기 전에 현재 신호 상태를 초기화합니다.
 * @returns {Function} returns.sendDebateEvent - 현재 방으로 사회자 토론 이벤트를 발행합니다.
 * @returns {Error | null} returns.error - 가장 최근에 발생한 소켓 오류입니다.
 */
export default function useChairmanSocket(roomId: number) {
  const queryClient = useQueryClient();
  const {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    publish,
    addConnectionListener,
    error,
  } = useSocket();

  const [signalCount, setSignalCount] = useState<number>(0);
  const [lastSignalTime, setLastSignalTime] = useState<number | null>(null);

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
    disconnect();
    queryClient.removeQueries({
      queryKey: chairmanTokenQueryKey(String(roomId)),
      exact: true,
    });
  }, [disconnect, queryClient, resetSignalState, roomId]);

  useEffect(() => {
    return addConnectionListener(resetSignalState);
  }, [addConnectionListener, resetSignalState]);

  // 서버로부터 토론 이벤트를 갱신해달라는 요청을 받게 될 채널 구독
  useEffect(() => {
    const destination = `/chairman/${roomId}`;

    resetSignalState();

    subscribe(destination, () => {
      setSignalCount((prev) => prev + 1);
      setLastSignalTime(Date.now());
    });

    return () => {
      unsubscribe(destination);
    };
  }, [roomId, resetSignalState, subscribe, unsubscribe]);

  useEffect(() => {
    if (!error) {
      return;
    }

    // TODO: Replace with Toast when a global Toast API is available.
    resetSignalState();
    console.error('Chairman socket connection failed.', error);
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

      if (isTimerEventType(eventType)) {
        if (payload === null) {
          console.error('No payload for timer event.');
          return;
        } else {
          body = {
            eventType,
            data: payload,
          };
        }
      } else {
        body = {
          eventType,
          data: null,
        };
      }

      publish(destination, body, { Authorization: authToken });
    },
    [roomId, publish],
  );

  return {
    signalCount,
    lastSignalTime,
    connect: connectChairmanSocket,
    disconnect: disconnectChairmanSocket,
    sendDebateEvent,
    error,
  };
}
