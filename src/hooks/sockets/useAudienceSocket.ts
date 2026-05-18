import { useCallback, useEffect, useState } from 'react';
import { IMessage } from '@stomp/stompjs';
import useSocket from './useSocket';
import { SocketMessage } from '../../apis/sockets/type';

/**
 * 청중 전용 웹소켓 훅입니다.
 * 토론 이벤트 채널을 구독하여 실시간 토론 정보를 수령합니다.
 * 모든 이벤트는 리스트에 누적되어 저장됩니다.
 *
 * * ⚠️ 주의: 이 훅을 컴포넌트에서 호출하여 페이지가 마운트(렌더링)되는 순간,
 * 내부의 `useEffect`가 실행되어 즉시 `/room/{roomId}` 채널에 대한 구독(Subscribe)을 요청합니다.
 * 컴포넌트가 언마운트되면 해당 채널의 구독은 자동으로 해제됩니다.
 * * 청중은 토론 데이터를 수신만 하며, 송신(Publish) 권한은 제공되지 않습니다.
 *
 * @param {number} roomId - 입장한 토론방의 고유 ID
 * @returns {Object} 청중 소켓 상태와 제어 함수를 반환합니다.
 * @returns {SocketMessage[]} returns.messages - 현재 소켓 세션에서 수신한 메시지 목록입니다.
 * @returns {Function} returns.connect - `useSocket.connect`에 위임하기 전에 현재 메시지를 초기화합니다.
 * @returns {Function} returns.disconnect - `useSocket.disconnect`에 위임하기 전에 현재 메시지를 초기화합니다.
 * @returns {Error | null} returns.error - 가장 최근에 발생한 소켓 오류입니다.
 */
export default function useAudienceSocket(roomId: number) {
  const {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    addConnectionListener,
    error,
  } = useSocket();
  const [messages, setMessages] = useState<SocketMessage[]>([]);

  /**
   * 현재 소켓 세션에서 누적된 청중 메시지를 모두 초기화합니다.
   * 세션 간에 오래된 메시지가 남지 않도록, 래핑된 connect 및 disconnect
   * 제어 함수에서 사용하는 초기화 동작을 한곳에 모읍니다.
   */
  const resetMessages = useCallback(() => {
    setMessages([]);
  }, []);

  /**
   * 이전에 수신한 메시지를 초기화한 뒤 청중 소켓을 시작합니다.
   * 새 연결이 이전 소켓 세션의 데이터를 재사용하지 않고 빈 메시지 목록으로
   * 시작되도록 `useSocket.connect`를 래핑합니다.
   */
  const connectAudienceSocket = useCallback(
    (options?: Parameters<typeof connect>[0]) => {
      resetMessages();
      connect(options);
    },
    [connect, resetMessages],
  );

  /**
   * 현재 메시지 목록을 초기화한 뒤 청중 소켓을 종료합니다.
   * 수동으로 연결을 해제할 때도 React 상태에 남아 있을 수 있는 세션 단위
   * 메시지를 제거하기 위해 `useSocket.disconnect`를 래핑합니다.
   */
  const disconnectAudienceSocket = useCallback(() => {
    resetMessages();
    disconnect();
  }, [disconnect, resetMessages]);

  useEffect(() => {
    return addConnectionListener(resetMessages);
  }, [addConnectionListener, resetMessages]);

  useEffect(() => {
    if (!error) {
      return;
    }

    window.alert(error.message);
    disconnectAudienceSocket();
  }, [disconnectAudienceSocket, error]);

  useEffect(() => {
    const destination = `/room/${roomId}`;

    resetMessages();

    // 토론 이벤트를 발행하는 채널 구독 및 메시지 수신 시 상태 업데이트
    subscribe(destination, (message: IMessage) => {
      try {
        const parsedData = JSON.parse(message.body);
        setMessages((prev) => [...prev, parsedData]);
      } catch (e) {
        console.error('메시지 파싱 오류:', e);
      }
    });

    // 컴포넌트 언마운트 또는 roomId 변경 시 해당 채널 구독 해제
    return () => {
      unsubscribe(destination);
    };
  }, [roomId, resetMessages, subscribe, unsubscribe]);

  return {
    messages,
    connect: connectAudienceSocket,
    disconnect: disconnectAudienceSocket,
    error,
  };
}
