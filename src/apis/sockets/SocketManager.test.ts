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

describe('SocketManager', () => {
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
  describe('Connection & Disconnection', () => {
    it('소켓 연결 시도 시 클라이언트 인스턴스를 생성하고, 인스턴스 생성 여부를 검증해야 한다', () => {
      socketManager.connect();

      expect(clientInstances).toHaveLength(1);
      expect(getLatestClient().activate).toHaveBeenCalledOnce();
    });

    it('소켓 연결 시도 시 주어진 url을 SockJS의 연결 주소로 사용해야 한다', () => {
      socketManager.connect({ url: 'https://socket.example.com/ws' });
      getLatestClient().config.webSocketFactory?.();

      expect(SockJS).toHaveBeenCalledWith('https://socket.example.com/ws');
    });

    it('소켓 연결 시도 시 주어진 baseUrl을 /ws 경로와 조합해 SockJS 연결 주소로 사용해야 한다', () => {
      socketManager.connect({ baseUrl: 'https://socket.example.com' });
      getLatestClient().config.webSocketFactory?.();

      expect(SockJS).toHaveBeenCalledWith('https://socket.example.com/ws');
    });

    it('소켓 연결 시도 시 url과 baseUrl이 제공되지 않은 경우 환경 변수 기반 주소를 사용해야 한다', () => {
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

    it('연결을 끊을 때, 클라이언트 인스턴스의 비활성화 여부를 검증해야 한다', () => {
      socketManager.connect();
      const client = getLatestClient();

      socketManager.disconnect();

      expect(client.deactivate).toHaveBeenCalledOnce();
    });

    it('연결을 끊고 재연결하면, 새 클라이언트 인스턴스를 생성해야 한다', () => {
      socketManager.connect();
      socketManager.disconnect();
      socketManager.connect();

      expect(clientInstances).toHaveLength(2);
      expect(getLatestClient().activate).toHaveBeenCalledOnce();
    });
  });

  // --- [그룹 2] 지수 백오프 재연결 ---
  describe('Reconnection & Full Jitter Backoff', () => {
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
    it('웹 소켓 연결이 끊기면 재시도 전에 서버 부하를 방지하기 위해 지수 백오프 딜레이를 갱신해야 한다', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      socketManager.connect({ baseRetryDelayMs: 1000 });

      const client = getLatestClient();

      // 초기 딜레이: calculateBackoffDelay(0) = 500 + 10
      expect(client.reconnectDelay).toBe(500 + 10);

      // 1번째 끊김: retryCount=0 기준 계산 → 500 + 10, 이후 retryCount=1
      client.config.onWebSocketClose?.({} as CloseEvent);
      expect(client.reconnectDelay).toBe(500 + 10);

      // 2번째 끊김: retryCount=1 기준 계산 → 1000, 이후 retryCount=2
      client.config.onWebSocketClose?.({} as CloseEvent);
      expect(client.reconnectDelay).toBe(1000 + 10);
    });

    it('최대 재시도 횟수 초과 시 재시도 딜레이를 0으로 설정하고 연결을 해제해야 한다', () => {
      socketManager.connect({ maxRetries: 3 });
      const client = getLatestClient();

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
  describe('Subscribe & Publish', () => {
    it('연결이 되지 않았는데 채널 구독 시, null을 반환해야 한다', () => {
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

    it('연결이 성립된 후 메시지를 발행할 시, 직렬화된 JSON 데이터를 전송해야 한다', () => {
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

  describe('Connect Listeners (Observer Pattern)', () => {
    it('소켓 연결 시 동작해야 할 함수 목록에 등록한 리스너는, 연결 시 호출되어야 한다', () => {
      const listener = vi.fn();
      socketManager.onConnectEvent(listener);
      socketManager.connect();

      const client = getLatestClient();
      client.config.onConnect?.({} as IFrame);

      expect(listener).toHaveBeenCalledOnce();
    });

    it('소켓 연결 시 동작해야 할 함수 목록에서 삭제한 리스너는, 연결 시 호출되지 않아야 한다', () => {
      const listener = vi.fn();
      socketManager.onConnectEvent(listener);
      socketManager.offConnectEvent(listener);
      socketManager.connect();

      const client = getLatestClient();
      client.config.onConnect?.({} as IFrame);

      expect(listener).not.toHaveBeenCalled();
    });

    it('소켓 연결 종료 시 동작해야 할 함수 목록에 등록한 리스너는, 연결 종료 시 호출되어야 한다', () => {
      const listener = vi.fn();
      socketManager.onCloseEvent(listener);
      socketManager.connect();

      const client = getLatestClient();
      client.config.onWebSocketClose?.({} as CloseEvent);

      expect(listener).toHaveBeenCalledOnce();
    });

    it('소켓 연결 종료 시 동작해야 할 함수 목록에서 삭제한 리스너는, 연결 종료 시 시 호출되지 않아야 한다', () => {
      const listener = vi.fn();
      socketManager.onCloseEvent(listener);
      socketManager.offCloseEvent(listener);
      socketManager.connect();

      const client = getLatestClient();
      client.config.onWebSocketClose?.({} as CloseEvent);

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
