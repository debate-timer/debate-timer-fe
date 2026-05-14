import { useEffect, useState } from 'react';
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
 * @returns {Object} 수신된 메시지 목록(messages) 및 연결 제어 함수(connect, disconnect, error)
 */
export default function useAudienceSocket(roomId: number) {
  const { connect, disconnect, subscribe, unsubscribe, error } = useSocket();
  const [messages, setMessages] = useState<SocketMessage[]>([]);

  useEffect(() => {
    if (!error) {
      return;
    }

    window.alert(error.message);
    disconnect();
  }, [disconnect, error]);

  useEffect(() => {
    const destination = `/room/${roomId}`;

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
  }, [roomId, subscribe, unsubscribe]);

  return {
    messages,
    connect,
    disconnect,
    error,
  };
}
