import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { socketManager } from './SocketManager';
import type { IMessage, StompConfig } from '@stomp/stompjs';
import { SocketMessage } from './type';

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
    it('connect 호출 시 Client 인스턴스를 생성하고 activate를 실행해야 한다', () => {
      socketManager.connect();

      expect(clientInstances).toHaveLength(1);
      expect(getLatestClient().activate).toHaveBeenCalledOnce();
    });

    it('이미 연결된 상태에서 connect를 재호출하면 중복 연결을 방지해야 한다', () => {
      socketManager.connect();
      socketManager.connect();

      // Client 인스턴스가 하나만 생성되어야 한다
      expect(clientInstances).toHaveLength(1);
    });

    it('disconnect 호출 시 deactivate를 실행해야 한다', () => {
      socketManager.connect();
      const client = getLatestClient();

      socketManager.disconnect();

      expect(client.deactivate).toHaveBeenCalledOnce();
    });

    it('disconnect 후 재연결하면 새 Client 인스턴스를 생성해야 한다', () => {
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
     *   초기 connect:  calculateBackoffDelay(0) = floor(0.5 * 1000 * 2^0) = 500
     *   1번째 close:   calculateBackoffDelay(0) = floor(0.5 * 1000 * 2^0) = 500  → retryCount: 0 → 1
     *   2번째 close:   calculateBackoffDelay(1) = floor(0.5 * 1000 * 2^1) = 1000 → retryCount: 1 → 2
     */
    it('onWebSocketClose 발생 시 지수 백오프 딜레이를 갱신해야 한다', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      socketManager.connect({ baseRetryDelayMs: 1000 });

      const client = getLatestClient();

      // 초기 딜레이: calculateBackoffDelay(0) = 500
      expect(client.reconnectDelay).toBe(500);

      // 1번째 끊김: retryCount=0 기준 계산 → 500, 이후 retryCount=1
      client.config.onWebSocketClose?.({} as CloseEvent);
      expect(client.reconnectDelay).toBe(500);

      // 2번째 끊김: retryCount=1 기준 계산 → 1000, 이후 retryCount=2
      client.config.onWebSocketClose?.({} as CloseEvent);
      expect(client.reconnectDelay).toBe(1000);
    });

    it('최대 재시도 횟수(maxRetries) 초과 시 reconnectDelay를 0으로 설정하고 연결을 해제해야 한다', () => {
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

    it('onConnect 실행 시 retryCount가 0으로 리셋되어야 한다', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      socketManager.connect({ baseRetryDelayMs: 1000, maxRetries: 5 });
      const client = getLatestClient();

      // 끊김 2번 → retryCount = 2
      client.config.onWebSocketClose?.({} as CloseEvent);
      client.config.onWebSocketClose?.({} as CloseEvent);

      // 재연결 성공 → retryCount 0으로 리셋
      client.config.onConnect?.({} as IMessage);

      // 끊김 1번: retryCount=0 기준 계산 → 500 (retryCount가 리셋됐으므로)
      client.config.onWebSocketClose?.({} as CloseEvent);
      expect(client.reconnectDelay).toBe(500);
    });
  });

  // --- [그룹 3] 구독 & 발행 ---
  describe('Subscribe & Publish', () => {
    it('연결 전 subscribe 호출 시 null을 반환해야 한다', () => {
      const result = socketManager.subscribe('/topic/test', vi.fn());
      expect(result).toBeNull();
    });

    it('연결 후 subscribe 호출 시 client.subscribe를 실행해야 한다', () => {
      socketManager.connect();
      const client = getLatestClient();
      client.connected = true; // 연결 완료 상태 시뮬레이션

      const callback = () => console.log('test');
      socketManager.subscribe('/topic/test', callback);

      expect(client.subscribe).toHaveBeenCalledWith('/topic/test', callback);
    });

    it('연결 전 publish 호출 시 메시지를 전송하지 않아야 한다', () => {
      socketManager.publish('/app/test', {} as SocketMessage);
      expect(clientInstances).toHaveLength(0);
    });

    it('연결 후 publish 호출 시 JSON 직렬화된 body를 전송해야 한다', () => {
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
});
