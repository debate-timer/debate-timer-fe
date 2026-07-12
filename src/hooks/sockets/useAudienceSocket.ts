import { useCallback, useEffect, useState } from 'react';
import { IMessage } from '@stomp/stompjs';
import useSocket from './useSocket';
import { SocketMessage } from '../../apis/sockets/type';
import { isSocketMessage } from '../../apis/sockets/util';

/**
 * 청중 전용 웹소켓 훅입니다.
 * 토론 이벤트 채널을 구독하여 실시간 토론 정보를 수령합니다.
 *
 * * ⚠️ 주의: 기본적으로 이 훅을 컴포넌트에서 호출하여 페이지가 마운트(렌더링)되는 순간,
 * 내부의 `useEffect`가 실행되어 즉시 `/room/{roomId}` 채널에 대한 구독(Subscribe)을 요청합니다.
 * `enabled`가 false이면 구독하지 않으며, 컴포넌트가 언마운트되면 활성 구독은 자동으로 해제됩니다.
 * * 청중은 토론 데이터를 수신만 하며, 송신(Publish) 권한은 제공되지 않습니다.
 *
 * @param {number} roomId - 입장한 토론방의 고유 ID
 * @param {UseAudienceSocketOptions} options - 소켓 채널 구독 활성화 옵션
 * @returns {Object} 청중 소켓 상태와 제어 함수를 반환합니다.
 * @returns {SocketMessage | null} returns.latestMessage - 검증된 가장 최근의 수신 메시지입니다.
 * @returns {boolean} returns.isConnected - 소켓 연결 상태입니다.
 * @returns {Function} returns.connect - `useSocket.connect`에 위임하기 전에 현재 메시지를 초기화합니다.
 * @returns {Function} returns.disconnect - `useSocket.disconnect`에 위임하기 전에 현재 메시지를 초기화합니다.
 * @returns {Error | null} returns.error - 가장 최근에 발생한 소켓 오류입니다.
 */
interface UseAudienceSocketOptions {
  enabled?: boolean;
}

export default function useAudienceSocket(
  roomId: number,
  options: UseAudienceSocketOptions = {},
) {
  const { enabled = true } = options;
  const {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    addConnectionListener,
    isConnected,
    error,
  } = useSocket();
  const [latestMessage, setLatestMessage] = useState<SocketMessage | null>(
    null,
  );

  /**
   * 수신한 최신 청중 메시지를 초기화합니다.
   * 세션 간에 오래된 메시지가 남지 않도록, 래핑된 connect 및 disconnect
   * 제어 함수에서 사용하는 초기화 동작을 한곳에 모읍니다.
   */
  const resetMessage = useCallback(() => {
    setLatestMessage(null);
  }, []);

  /**
   * 이전에 수신한 메시지를 초기화한 뒤 청중 소켓을 시작합니다.
   * 새 연결이 이전 소켓 세션의 데이터를 재사용하지 않고 빈 상태로
   * 시작되도록 `useSocket.connect`를 래핑합니다.
   */
  const connectAudienceSocket = useCallback(
    (options?: Parameters<typeof connect>[0]) => {
      resetMessage();
      connect(options);
    },
    [connect, resetMessage],
  );

  /**
   * 현재 메시지를 초기화한 뒤 청중 소켓을 종료합니다.
   * 수동으로 연결을 해제할 때도 React 상태에 남아 있을 수 있는 세션 단위
   * 메시지를 제거하기 위해 `useSocket.disconnect`를 래핑합니다.
   */
  const disconnectAudienceSocket = useCallback(() => {
    resetMessage();
    disconnect();
  }, [disconnect, resetMessage]);

  useEffect(() => {
    return addConnectionListener(resetMessage);
  }, [addConnectionListener, resetMessage]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const destination = `/room/${roomId}`;

    resetMessage();

    // 토론 이벤트를 발행하는 채널 구독 및 메시지 수신 시 상태 업데이트
    subscribe(destination, (message: IMessage) => {
      try {
        const parsedData = JSON.parse(message.body);
        if (isSocketMessage(parsedData)) {
          setLatestMessage(parsedData);
        } else {
          console.log('잘못된 소켓 메시지 형식입니다:', parsedData);
        }
      } catch (e) {
        console.log('메시지 파싱 오류:', e);
      }
    });

    // 컴포넌트 언마운트 또는 roomId 변경 시 해당 채널 구독 해제
    return () => {
      unsubscribe(destination);
    };
  }, [enabled, roomId, resetMessage, subscribe, unsubscribe]);

  return {
    latestMessage,
    isConnected,
    error,
    connect: connectAudienceSocket,
    disconnect: disconnectAudienceSocket,
  };
}
