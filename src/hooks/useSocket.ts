import { useEffect, useRef, useCallback, useState } from 'react';
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
  const activeSubscriptions = useRef<Map<string, StompSubscription>>(new Map());

  // 재연결시 복구를 위해 지금까지 구독했던 채널과 콜백을 저장하는 보관서
  const subscriptionInfos = useRef<Map<string, (message: IMessage) => void>>(
    new Map(),
  );

  // 오류 안내를 위한 상태
  const [error, setError] = useState<Error | null>(null);

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
   * 애초에 소켓이 연결되기도 전에 구독을 요청하는 것 자체가 모순적인 일이니까요.
   *
   * @params destination - 목적지 채널
   * @params callback - 구독 이후 메시지를 받을 때마다 수행할 동작이 묘사된 콜백 함수
   */
  const subscribe = useCallback(
    (destination: string, callback: (message: IMessage) => void) => {
      // 구독 정보를 백업 리스트에 등록
      subscriptionInfos.current.set(destination, callback);

      // 소켓이 연결된 상태라면 즉시 구독 실행
      if (socketManager.isConnected()) {
        // 중복 구독 방지
        if (activeSubscriptions.current.has(destination)) {
          return;
        }

        // 중복이 아니라면 리스트에 등록
        const subscription = socketManager.subscribe(destination, callback);
        if (subscription) {
          activeSubscriptions.current.set(destination, subscription);
        }
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
    // 백업 리스트의 구독 정보를 제거
    subscriptionInfos.current.delete(destination);

    // 현재 활성화되어 있는 구독 리스트에서도 제거
    const subscription = activeSubscriptions.current.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      activeSubscriptions.current.delete(destination);
    }
  }, []);

  // 클린업
  useEffect(() => {
    // 소켓이 연결될 때마다 실행될 핸들러
    const handleConnect = () => {
      const recover = () => {
        // 기존 활성화된 구독 리스트 초기화
        activeSubscriptions.current.clear();

        // 백업 리스트의 모든 구독을 다시 활성화
        subscriptionInfos.current.forEach((callback, destination) => {
          const subscription = socketManager.subscribe(destination, callback);
          if (!subscription) {
            throw new Error(`채널 구독 실패: ${destination}`);
          }
          activeSubscriptions.current.set(destination, subscription);
        });
      };

      // 재시도 및 오류 복구 최초 1회
      try {
        recover();
      } catch (error) {
        console.warn('🚨 리스너 복구 1차 실패, 1초 후 재시도합니다.', error);

        // 1초 후 2차 복구 시도
        setTimeout(() => {
          try {
            recover();
          } catch (retryError) {
            console.error(
              '🚨 재시도 실패! 복구 불가능한 상태입니다.',
              retryError,
            );
            // 💡 훅이 자체적으로 에러 상태를 업데이트
            setError(
              retryError instanceof Error
                ? retryError
                : new Error(String(retryError)),
            );
          }
        }, 1000);
      }
    };

    // 이 핸들러 함수를 발행자(SocketManager)에 등록
    socketManager.onConnectEvent(handleConnect);

    // 리스너 등록 이후 연결이 이미 되어 있는 게 확인되면, 핸들러 바로 실행
    if (socketManager.isConnected()) {
      handleConnect();
    }

    // 언마운트 시 구독 클리어하는 함수
    return () => {
      // 먼저 발행자(SocketManager)에게 등록된 핸들러부터 제거
      socketManager.offConnectEvent(handleConnect);

      // 활성화된 모든 구독 해제
      activeSubscriptions.current.forEach((subscription) =>
        subscription.unsubscribe(),
      );

      // 아래 2줄에 대한 경고는 Ref가 React 컴포넌트일 경우에만 유효하므로, 여기선 비활성화
      // eslint-disable-next-line react-hooks/exhaustive-deps
      activeSubscriptions.current.clear();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      subscriptionInfos.current.clear();
    };
  }, []);

  // 컴포넌트에서 사용할 함수들만 반환
  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    publish,
    error,
  };
};
