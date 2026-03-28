import { useEffect, useRef, useCallback } from 'react';
import { IMessage, StompHeaders, StompSubscription } from '@stomp/stompjs';
import { socketManager, SocketOptions } from '../apis/sockets/SocketManager';
import { SocketMessage } from '../apis/sockets/type';

export const useSocket = () => {
  // 현재 컴포넌트에서 활성화한 구독을 저장하는 보관소
  const subscriptions = useRef<Map<string, StompSubscription>>(new Map());

  // 연결
  const connect = useCallback((options?: SocketOptions) => {
    socketManager.connect(options);
  }, []);

  // 해제
  const disconnect = useCallback(() => {
    socketManager.disconnect();
  }, []);

  // 메시지 발신 (Publish)
  const publish = useCallback(
    (destination: string, body: SocketMessage, headers: StompHeaders) => {
      socketManager.publish(destination, body, headers);
    },
    [],
  );

  /**
   * 구독 (Subscribe)
   *
   * 이 함수는 반드시 소켓이 연결된 뒤에 사용해야 합니다!
   * 더 정확히 말하면, 소켓이 연결 성공 후에 실행하는 콜백 함수인 `onConnect` 안에
   * 구독 함수를 넣어서 사용해야 해요.
   * 애초에 소켓이 연결되기도 전에 구독을 요청하는 것 자체가 모순적인 일이니까요.
   *
   * 예를 들어, 아래 코드와 같이요:
   * ```
   * useEffect(() => {
   *   connect({
   *     onConnect: () => {
   *       // ✅ 소켓 연결이 완전히 끝난 뒤에 구독해야 안전합니다!
   *       subscribe('/topic/room/123', (msg) => console.log(msg));
   *     }
   *   });
   * }, []);
   * ```
   */
  const subscribe = useCallback(
    (destination: string, callback: (message: IMessage) => void) => {
      // 이미 해당 채널을 구독 중이면 중복 구독 방지
      if (subscriptions.current.has(destination)) return;

      // 구독 중이지 않다면, 구독 요청 후 성공 시 useRef로 유지하는 Map에 저장
      const subscription = socketManager.subscribe(destination, callback);
      if (subscription) {
        subscriptions.current.set(destination, subscription);
      }
    },
    [],
  );

  // 수동 구독 해제
  const unsubscribe = useCallback((destination: string) => {
    const subscription = subscriptions.current.get(destination);
    if (subscription) {
      subscription.unsubscribe(); // STOMP 서버에 해제 요청
      subscriptions.current.delete(destination); // 맵에서 제거
    }
  }, []);

  // 클린업
  useEffect(() => {
    return () => {
      // 현재 컴포넌트가 만들어둔 모든 구독을 순회하며 일괄 해제합니다.
      subscriptions.current.forEach((sub) => sub.unsubscribe());

      // 아래 Ref의 경우 React에 의해 렌더링되는 컴포넌트를 지시하지 않기 때문에,
      // 주석의 경고와 전혀 연관이 없으므로 경고를 꺼 둡니다.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      subscriptions.current.clear();

      // 페이지를 나갈 때 소켓 연결을 끊을 것인가? (정책 결정 후 수정 예정)
      socketManager.disconnect();
    };
  }, []);

  // 컴포넌트에서 사용할 함수들만 반환
  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    publish,
  };
};
