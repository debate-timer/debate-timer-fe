import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { socketManager } from './SocketManager';
import type { IFrame, StompConfig } from '@stomp/stompjs';
import { SocketMessage } from './type';
import SockJS from 'sockjs-client';

// ------------------------------------------------------------------
// 1. 외부 라이브러리 Mocking
// ------------------------------------------------------------------

vi.mock('sockjs-client', () => ({ default: vi.fn() }));

/**
 * vi.hoisted: vi.mock 팩토리보다 먼저 실행됨을 보장합니다.
 * 테스트 코드에서 생성된 Client 인스턴스를 추적하기 위해 사용합니다.
 */
const clientInstances = vi.hoisted(
  (): {
    activate: ReturnType<typeof vi.fn>;
    deactivate: ReturnType<typeof vi.fn>;
    publish: ReturnType<typeof vi.fn>;
    subscribe: ReturnType<typeof vi.fn>;
    active: boolean;
    connected: boolean;
    reconnectDelay: number;
    config: StompConfig;
  }[] => [],
);

/**
 * 핵심 전략: vi.fn().mockImplementation() 방식을 버리고,
 * vi.mock 팩토리 내부에 진짜 클래스를 직접 정의합니다.
 *
 * vi.clearAllMocks / vi.resetAllMocks는 vi.fn()의 구현체를 초기화하지만,
 * 팩토리 클로저 내부에 정의된 클래스 자체는 절대 건드리지 못합니다.
 * 따라서 new Client()는 항상 올바른 인스턴스를 생성합니다.
 */
vi.mock('@stomp/stompjs', () => {
  class MockClient {
    activate = vi.fn().mockImplementation(() => {
      this.active = true;
    });
    deactivate = vi.fn().mockImplementation(() => {
      this.active = false;
    });
    publish = vi.fn();
    subscribe = vi.fn();
    active = false;
    connected = false;
    reconnectDelay: number;
    config: StompConfig;

    constructor(config: StompConfig) {
      this.config = config;
      this.reconnectDelay = config?.reconnectDelay ?? 0;
      clientInstances.push(this);
    }
  }

  return { Client: MockClient };
});

// ------------------------------------------------------------------
// 2. 헬퍼
// ------------------------------------------------------------------

/** 가장 최근에 생성된 Client 인스턴스를 반환합니다. */
const getLatestClient = () => clientInstances[clientInstances.length - 1];

// ------------------------------------------------------------------
// 3. 테스트 스위트
// ------------------------------------------------------------------

describe('소켓 관리자 테스트', () => {
  beforeEach(() => {
    /**
     * 순서 중요:
     * 1. disconnect 먼저 → 이전 테스트의 client.active = true이므로 deactivate 실행, client = null 처리
     * 2. 인스턴스 배열 초기화
     * 3. vi.fn() 호출 기록 초기화 (MockClient 클래스 자체에는 영향 없음)
     */
    socketManager.disconnect();
    clientInstances.length = 0;
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_BASE_URL', 'https://test.com');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // --- [그룹 1] 연결 & 해제 ---
  describe('연결 및 연결 종료', () => {
    it('소켓 연결 시 클라이언트 객체를 만들고 실행해야 한다', () => {
      socketManager.connect();

      expect(clientInstances).toHaveLength(1);
      expect(getLatestClient().activate).toHaveBeenCalledOnce();
    });

    it('직접 지정한 주소로 소켓에 연결해야 한다', () => {
      socketManager.connect({ url: 'https://socket.example.com/ws' });
      getLatestClient().config.webSocketFactory?.();

      expect(SockJS).toHaveBeenCalledWith('https://socket.example.com/ws');
    });

    it('기본 주소에 소켓 경로를 붙여 연결해야 한다', () => {
      socketManager.connect({ baseUrl: 'https://socket.example.com' });
      getLatestClient().config.webSocketFactory?.();

      expect(SockJS).toHaveBeenCalledWith('https://socket.example.com/ws');
    });

    it('주소가 없으면 환경 변수 기반 주소로 연결해야 한다', () => {
      socketManager.connect();
      getLatestClient().config.webSocketFactory?.();

      expect(SockJS).toHaveBeenCalledWith('https://test.com/ws');
    });

    it('이미 연결된 상태에서 소켓 연결을 다시 시도하면 중복 연결을 방지해야 한다', () => {
      socketManager.connect();
      socketManager.connect();

      // Client 인스턴스가 하나만 생성되어야 한다
      expect(clientInstances).toHaveLength(1);
    });

    it('연결을 끊을 때 클라이언트를 비활성화해야 한다', () => {
      socketManager.connect();
      const client = getLatestClient();

      socketManager.disconnect();

      expect(client.deactivate).toHaveBeenCalledOnce();
    });

    it('연결을 끊고 다시 연결하면 새 클라이언트를 만들어야 한다', () => {
      socketManager.connect();
      socketManager.disconnect();
      socketManager.connect();

      expect(clientInstances).toHaveLength(2);
      expect(getLatestClient().activate).toHaveBeenCalledOnce();
    });
  });

  // --- [그룹 2] 지수 백오프 재연결 ---
  describe('재연결 대기 시간', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    /**
     * calculateBackoffDelay(retryCount) = floor(random * base * 2^retryCount)
     * handleReconnection()은 현재 retryCount로 딜레이를 계산한 후 retryCount를 증가시킵니다.
     *
     * Math.random = 0.5, baseRetryDelayMs = 1000 고정 시:
     *   초기 connect:  calculateBackoffDelay(0) = floor(0.5 * 1000 * 2^0) = 500 + 10
     *   1번째 close:   calculateBackoffDelay(0) = floor(0.5 * 1000 * 2^0) = 500 + 10  → retryCount: 0 → 1
     *   2번째 close:   calculateBackoffDelay(1) = floor(0.5 * 1000 * 2^1) = 1000 + 10 → retryCount: 1 → 2
     */
    it('연결이 끊기면 서버 부담을 줄이도록 재시도 대기 시간을 늘려야 한다', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      socketManager.connect({ baseRetryDelayMs: 1000 });

      const client = getLatestClient();
      client.config.onConnect?.({} as IFrame); // 연결 성공 상태로 만들기

      // 초기 딜레이: calculateBackoffDelay(0) = 500 + 10
      expect(client.reconnectDelay).toBe(500 + 10);

      // 1번째 끊김: retryCount=0 기준 계산 → 500 + 10, 이후 retryCount=1
      client.config.onWebSocketClose?.({} as CloseEvent);
      expect(client.reconnectDelay).toBe(500 + 10);

      // 2번째 끊김: retryCount=1 기준 계산 → 1000, 이후 retryCount=2
      client.config.onWebSocketClose?.({} as CloseEvent);
      expect(client.reconnectDelay).toBe(1000 + 10);
    });

    it('최대 재시도 횟수를 넘으면 재시도를 멈추고 연결을 해제해야 한다', () => {
      socketManager.connect({ maxRetries: 3 });
      const client = getLatestClient();
      client.config.onConnect?.({} as IFrame); // 연결 성공 상태로 만들기

      // 3번까지는 아직 maxRetries 미초과 → deactivate 호출 안 됨
      for (let i = 0; i < 3; i++) {
        client.config.onWebSocketClose?.({} as CloseEvent);
      }
      expect(client.deactivate).not.toHaveBeenCalled();

      // 4번째 끊김: retryCount(3) >= maxRetries(3) → 포기
      client.config.onWebSocketClose?.({} as CloseEvent);
      expect(client.reconnectDelay).toBe(0);
      expect(client.deactivate).toHaveBeenCalledOnce();
    });

    it('연결에 성공할 경우 재시도 횟수 카운터를 0으로 리셋해야 한다', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      socketManager.connect({ baseRetryDelayMs: 1000, maxRetries: 5 });
      const client = getLatestClient();
      client.config.onConnect?.({} as IFrame); // 처음 연결 성공 상태로 만들기

      // 끊김 2번 → retryCount = 2
      client.config.onWebSocketClose?.({} as CloseEvent);
      client.config.onWebSocketClose?.({} as CloseEvent);

      // 재연결 성공 → retryCount 0으로 리셋
      client.config.onConnect?.({} as IFrame);

      // 끊김 1번: retryCount=0 기준 계산 → 500 + 10 (retryCount가 리셋됐으므로)
      client.config.onWebSocketClose?.({} as CloseEvent);
      expect(client.reconnectDelay).toBe(500 + 10);
    });
  });

  // --- [그룹 3] 구독 & 발행 ---
  describe('구독 및 메시지 발행', () => {
    it('연결 전 채널 구독은 빈 결과를 반환해야 한다', () => {
      const result = socketManager.subscribe('/topic/test', vi.fn());
      expect(result).toBeNull();
    });

    it('연결이 성립된 후 채널 구독 시, 클라이언트의 구독 함수가 실행되어야 한다', () => {
      socketManager.connect();
      const client = getLatestClient();
      client.connected = true; // 연결 완료 상태 시뮬레이션

      const callback = () => console.log('test');
      socketManager.subscribe('/topic/test', callback);

      expect(client.subscribe).toHaveBeenCalledWith('/topic/test', callback);
    });

    it('연결이 되지 않았는데 메시지를 발행할 시, 전송하지 않아야 한다', () => {
      socketManager.publish('/app/test', {} as SocketMessage);
      expect(clientInstances).toHaveLength(0);
    });

    it('연결 후 메시지를 발행하면 직렬화된 데이터를 전송해야 한다', () => {
      socketManager.connect();
      const client = getLatestClient();
      client.connected = true;

      const message: SocketMessage = {
        eventType: 'NEXT',
        data: {
          timerType: 'NORMAL',
          currentTeam: 'PROS',
          remainingTime: 40,
          sequence: 0,
        },
      };
      socketManager.publish('/app/test', message);

      expect(client.publish).toHaveBeenCalledWith({
        destination: '/app/test',
        headers: undefined,
        body: JSON.stringify(message),
      });
    });
  });

  describe('연결 이벤트 리스너', () => {
    it('연결 리스너를 등록하면 연결 시 호출되어야 한다', () => {
      const listener = vi.fn();
      socketManager.onConnectEvent(listener);
      socketManager.connect();

      const client = getLatestClient();
      client.config.onConnect?.({} as IFrame);

      expect(listener).toHaveBeenCalledOnce();
    });

    it('연결 리스너를 해제하면 연결 시 호출되지 않아야 한다', () => {
      const listener = vi.fn();
      socketManager.onConnectEvent(listener);
      socketManager.offConnectEvent(listener);
      socketManager.connect();

      const client = getLatestClient();
      client.config.onConnect?.({} as IFrame);

      expect(listener).not.toHaveBeenCalled();
    });

    it('연결 종료 리스너를 등록하면 연결 종료 시 호출되어야 한다', () => {
      const listener = vi.fn();
      socketManager.onCloseEvent(listener);
      socketManager.connect();

      const client = getLatestClient();
      client.config.onWebSocketClose?.({} as CloseEvent);

      expect(listener).toHaveBeenCalledOnce();
    });

    it('연결 종료 리스너를 해제하면 연결 종료 시 호출되지 않아야 한다', () => {
      const listener = vi.fn();
      socketManager.onCloseEvent(listener);
      socketManager.offCloseEvent(listener);
      socketManager.connect();

      const client = getLatestClient();
      client.config.onWebSocketClose?.({} as CloseEvent);

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('오류 발생 및 이벤트 발행', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('오류 리스너를 등록하면 소켓 오류를 받고 해제 후에는 호출되지 않아야 한다', () => {
      const listener = vi.fn();
      socketManager.onErrorEvent(listener);

      // trigger error by failing URL
      socketManager.connect({ url: '', baseUrl: '' });
      expect(listener).toHaveBeenCalledOnce();
      const error = listener.mock.calls[0][0];
      expect(error.code).toBe('SOCKET_URL_UNAVAILABLE');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[SocketManager] 소켓 오류 발생',
        expect.objectContaining({
          code: 'SOCKET_URL_UNAVAILABLE',
          message: '웹소켓 연결 주소를 결정할 수 없습니다.',
          detail: undefined,
        }),
      );

      listener.mockClear();
      consoleErrorSpy.mockClear();
      socketManager.offErrorEvent(listener);
      socketManager.connect({ url: '', baseUrl: '' });
      expect(listener).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[SocketManager] 소켓 오류 발생',
        expect.objectContaining({
          code: 'SOCKET_URL_UNAVAILABLE',
        }),
      );
    });

    it('연결 주소를 결정할 수 없으면 주소 없음 오류를 한 번 발행해야 한다', () => {
      const listener = vi.fn();
      socketManager.onErrorEvent(listener);

      socketManager.connect({ url: '', baseUrl: '' });

      expect(listener).toHaveBeenCalledOnce();
      const error = listener.mock.calls[0][0];
      expect(error.code).toBe('SOCKET_URL_UNAVAILABLE');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[SocketManager] 소켓 오류 발생',
        expect.objectContaining({
          code: 'SOCKET_URL_UNAVAILABLE',
          message: '웹소켓 연결 주소를 결정할 수 없습니다.',
          detail: undefined,
        }),
      );
    });

    it('실시간 통신 오류가 발생하면 오류 메시지와 본문 상세를 함께 발행해야 한다', () => {
      const listener = vi.fn();
      socketManager.onErrorEvent(listener);
      socketManager.connect();

      const client = getLatestClient();
      client.config.onStompError?.({
        headers: { message: 'stomp msg' },
        body: 'body content',
      } as unknown as IFrame);

      expect(listener).toHaveBeenCalledOnce();
      const error = listener.mock.calls[0][0];
      expect(error.code).toBe('SOCKET_STOMP_ERROR');
      expect(error.message).toBe('stomp msg');
      expect(error.detail).toEqual({
        headers: { message: 'stomp msg' },
        body: 'body content',
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[SocketManager] 소켓 오류 발생',
        expect.objectContaining({
          code: 'SOCKET_STOMP_ERROR',
          message: 'stomp msg',
          detail: {
            headers: { message: 'stomp msg' },
            body: 'body content',
          },
        }),
      );
    });

    it('한 번도 연결에 성공하지 못한 채 종료되면 서버 거부 오류를 발행해야 한다', () => {
      const listener = vi.fn();
      socketManager.onErrorEvent(listener);
      socketManager.connect();

      const client = getLatestClient();
      client.config.onWebSocketClose?.({} as CloseEvent);

      expect(listener).toHaveBeenCalledOnce();
      const error = listener.mock.calls[0][0];
      expect(error.code).toBe('SOCKET_SERVER_REJECTED');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[SocketManager] 소켓 오류 발생',
        expect.objectContaining({
          code: 'SOCKET_SERVER_REJECTED',
          message:
            '서버에 의해 웹소켓 연결이 거부되었거나 즉시 종료되었습니다.',
          detail: undefined,
        }),
      );
    });

    it('연결 성공 후 종료되면 재시도 횟수가 남은 동안 오류 없이 재시도해야 한다', () => {
      const listener = vi.fn();
      socketManager.onErrorEvent(listener);
      socketManager.connect({ maxRetries: 2 });

      const client = getLatestClient();
      client.config.onConnect?.({} as IFrame); // 연결 성공

      // 1차 끊김: 오류 발행 안됨
      client.config.onWebSocketClose?.({} as CloseEvent);
      expect(listener).not.toHaveBeenCalled();

      // 2차 끊김: 오류 발행 안됨
      client.config.onWebSocketClose?.({} as CloseEvent);
      expect(listener).not.toHaveBeenCalled();

      // 3차 끊김: 재시도 초과 -> 오류 발행
      client.config.onWebSocketClose?.({} as CloseEvent);
      expect(listener).toHaveBeenCalledOnce();
      const error = listener.mock.calls[0][0];
      expect(error.code).toBe('SOCKET_RETRY_EXHAUSTED');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[SocketManager] 소켓 오류 발생',
        expect.objectContaining({
          code: 'SOCKET_RETRY_EXHAUSTED',
          message: '최대 재연결 시도 횟수를 초과했습니다.',
          detail: undefined,
        }),
      );
    });

    it('상태 확인 신호 누락으로 종료되어도 같은 재시도 정책을 따라야 한다', () => {
      const listener = vi.fn();
      socketManager.onErrorEvent(listener);
      socketManager.connect({ maxRetries: 1 });

      const client = getLatestClient();
      client.config.onConnect?.({} as IFrame); // 연결 성공

      // 하트비트 누락에 의한 1차 끊김: 오류 발행 안됨
      client.config.onWebSocketClose?.({} as CloseEvent);
      expect(listener).not.toHaveBeenCalled();

      // 2차 끊김: 재시도 초과 -> 오류 발행
      client.config.onWebSocketClose?.({} as CloseEvent);
      expect(listener).toHaveBeenCalledOnce();
      const error = listener.mock.calls[0][0];
      expect(error.code).toBe('SOCKET_RETRY_EXHAUSTED');
    });

    it('명시적으로 연결을 끊은 뒤에는 늦게 도착한 이벤트가 오류를 발행하지 않아야 한다', () => {
      const listener = vi.fn();
      socketManager.onErrorEvent(listener);
      socketManager.connect();

      const client = getLatestClient();
      socketManager.disconnect();

      // 과거 세션 이벤트
      client.config.onWebSocketClose?.({} as CloseEvent);
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
