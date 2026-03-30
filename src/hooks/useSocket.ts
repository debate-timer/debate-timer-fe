import { useEffect, useRef, useCallback } from 'react';
import { IMessage, StompHeaders, StompSubscription } from '@stomp/stompjs';
import { socketManager, SocketOptions } from '../apis/sockets/SocketManager';
import { SocketMessage } from '../apis/sockets/type';

/**
 * 소켓 연결을 돕는 React 훅입니다. 제공되는 함수는 아래와 같습니다:
 *
 * - `connect`는 기존 HTTP 연결을 WS 연결로 업그레이드합니다. `options`를 통해 설정을 변경할 수 있습니다.
 * 기본값은 [SocketManager.ts](../apis/sockets/SocketManager.ts) 참고.
 * - `disconnect`는 소켓 연결을 끊습니다. 소켓 연결을 끊어야 할 책임은 소켓을 연결한 페이지에 있습니다.
 * - `subscribe`는 특정 채널을 구독합니다.
 * - `unsubscribe`는 특정 채널의 구독을 끊습니다. 이 훅이 언마운트될 때, 현재 구독된 채널들에 대해 자동으로 호출됩니다.
 * - `publish`는 특정 채널로 메시지를 발행합니다.
 *
 * 특히, 구독 해제의 책임은 이 훅에 있으나, 연결 자체를 끊는 책임은 소켓을 호출한 페이지에 있다는 점을 유념해주세요.
 */
export const useSocket = () => {
  // 현재 컴포넌트에서 활성화한 구독을 저장하는 보관소
  const subscriptions = useRef<Map<string, StompSubscription>>(new Map());

  /**
   * 소켓 연결
   * HTTP 연결을 WS 연결로 업그레이드.
   * @param options - (선택 옵션) 소켓 연결에 사용할 옵션. 상세 항목은 [SocketManager.ts](../apis/sockets/SocketManager.ts) 참고.
   */
  const connect = useCallback((options?: SocketOptions) => {
    socketManager.connect(options);
  }, []);

  /**
   * 소켓 연결 해제
   * WS 연결을 끊음.
   */
  const disconnect = useCallback(() => {
    socketManager.disconnect();
  }, []);

  /**
   * 메시지 발행
   * 특정 채널로 메시지 발행.
   * @param destination - 목적지 채널
   * @param body - 발행할 메시지
   * @param headers - (선택 옵션) 필요에 따라 사용 가능한 STOMP 헤더.
   */
  const publish = useCallback(
    (destination: string, body: SocketMessage, headers?: StompHeaders) => {
      socketManager.publish(destination, body, headers);
    },
    [],
  );

  /**
   * 구독
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

  /**
   * 수동 구독 해제
   * 수동으로 구독을 해제하는 함수.
   * @param destination - 구독을 해제할 채널
   */
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
