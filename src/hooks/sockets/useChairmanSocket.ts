import { useEffect, useState, useCallback } from 'react';
import {
  SocketEventType,
  SocketMessage,
  TimerDataPayload,
} from '../../apis/sockets/type';
import { isTimerEventType } from '../../apis/sockets/util';
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
 * @returns {Object} 메시지 목록(messages), 제어 액션 함수(sendDebateEvent), 연결 제어 함수 등
 */
export default function useChairmanSocket(roomId: number) {
  const { connect, disconnect, subscribe, unsubscribe, publish, error } =
    useSocket();

  const [signalCount, setSignalCount] = useState<number>(0);
  const [lastSignalTime, setLastSignalTime] = useState<number | null>(null);

  // 서버로부터 토론 이벤트를 갱신해달라는 요청을 받게 될 채널 구독
  useEffect(() => {
    const destination = `/chairman/${roomId}`;

    subscribe(destination, () => {
      setSignalCount((prev) => prev + 1);
      setLastSignalTime(Date.now());
    });

    return () => {
      unsubscribe(destination);
    };
  }, [roomId, subscribe, unsubscribe]);

  useEffect(() => {
    if (!error) {
      return;
    }

    // TODO: Replace with Toast when a global Toast API is available.
    console.error('Chairman socket connection failed.', error);
  }, [error]);

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
    connect,
    disconnect,
    sendDebateEvent,
    error,
  };
}
