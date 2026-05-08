import { Client, IMessage, StompHeaders } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { SocketMessage } from './type';

/**
 * 소켓 설정을 정하는 인터페이스
 * - `maxRetries` 최대 재시도 횟수 (기본값 3회)
 * - `baseRetryDelayMs` 기본 재시도 대기 시간 (기본값 1000 ms)
 * - `heartbeatInMs` 수신 하트비트 주기 (기본값 10000 ms)
 * - `heartbeatOutMs` 발신 하트비트 주기 (기본값 10000 ms)
 */
export interface SocketOptions {
  /** 최대 재시도 횟수 (기본값: 3) */
  maxRetries?: number;

  /** 지수 백오프 계산의 기준이 되는 초기 지연 시간 (기본값: 1000ms) */
  baseRetryDelayMs?: number;

  /** 수신 하트비트 주기 (기본값: 10000ms) */
  heartbeatInMs?: number;

  /** 발신 하트비트 주기 (기본값: 10000ms) */
  heartbeatOutMs?: number;
}

// 기본값 객체 선언 (onConnect를 제외한 모든 필수 속성 정의)
const DEFAULT_OPTIONS: Required<SocketOptions> = {
  maxRetries: 3,
  baseRetryDelayMs: 1000,
  heartbeatInMs: 10000,
  heartbeatOutMs: 10000,
};

// 소켓 통신을 담당하는 클래스
class SocketManager {
  // 변수
  private client: Client | null = null;
  private static instance: SocketManager;
  private currentOptions = DEFAULT_OPTIONS; // 소켓 설정을 저장하는 변수
  private retryCount: number = 0;

  // 싱글톤 패턴 적용
  // - 생성자를 차단하여 외부에서의 객체 생성을 막음
  private constructor() {}

  // - 오직 클래스 수준 변수에서만 인스턴스에 호출할 수 있게 제한
  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  // 재연결 시 안정적 구독 복구를 위한 리스너를 모아두는 Set
  // - 관찰자 패턴(observer pattern) 적용
  // - 관찰자(observer)는 구독을 관리하는 useSocket 훅
  // - 발행자(publisher)는 재연결 여부를 알리는 이 클래스 (SocketManager)
  private connectListeners: Set<() => void> = new Set();

  /**
   * 관찰자를 등록하는 함수
   * @param listener - 연결 수립 시 각 구독에서 실행할 콜백 함수
   */
  public onConnectEvent(listener: () => void) {
    this.connectListeners.add(listener);
  }

  /**
   * 관찰자를 제거하는 함수
   * @param listener - 제거할 콜백 함수
   */
  public offConnectEvent(listener: () => void) {
    this.connectListeners.delete(listener);
  }

  /**
   * 연결 여부를 확인하는 함수
   * @returns 연결 여부
   */
  public isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  /**
   * 웹 소켓(STOMP) 연결을 초기화하고 서버와 세션을 수립합니다.
   * HTTPS에서 WS로 업그레이드 시 청중과 사회자 모두 무인증으로 연결합니다.
   *
   * @param options - 소켓 클라이언트 동작을 제어하는 선택적 설정 객체
   * @param options.maxRetries - 최대 재연결 시도 횟수 (기본값: 3)
   * @param options.baseRetryDelayMs - 지수 백오프 계산의 기준이 되는 초기 지연 시간 (기본값: 1000)
   * @param options.heartbeatInMs - 서버 > 클라이언트 수신 하트비트 주기(ms) (기본값: 10000)
   * @param options.heartbeatOutMs - 클라이언트 > 서버 발신 하트비트 주기(ms) (기본값: 10000)
   */
  public connect(options?: SocketOptions) {
    // 이미 클라이언트가 존재하고 연결되어 있다면 중복 연결 방지
    if (this.client && this.client.active) return;

    // 사용자가 지정한 옵션이 있다면 덮어쓰기
    this.retryCount = 0;
    this.currentOptions = { ...DEFAULT_OPTIONS, ...options };

    // 환경 변수에서 URL 로드
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    if (!baseUrl) {
      console.error('VITE_API_BASE_URL 환경 변수가 설정되지 않았습니다.');
      return;
    }
    const wsUrl = baseUrl + '/ws';

    const newClient = new Client({
      // wss:// 대신 https:// 주소를 SockJS 팩토리에 주입
      webSocketFactory: () => new SockJS(wsUrl),

      // 디버그 로그
      debug: (str) => {
        console.log('[STOMP DEBUG]', str);
      },

      // 자동 재연결 간격 (지수 백오프는 커스텀 구현이 필요하나, 기본 기능으로 5초 설정)
      reconnectDelay: this.calculateBackoffDelay(0),

      // 하트비트
      heartbeatIncoming: this.currentOptions.heartbeatInMs,
      heartbeatOutgoing: this.currentOptions.heartbeatOutMs,

      onConnect: () => {
        console.log('✅ 웹 소켓(STOMP) 연결 성공');
        this.retryCount = 0;

        // 모든 관찰자에게 연결이 수립되었다고 알림
        this.connectListeners.forEach((listener) => {
          try {
            listener();
          } catch (error) {
            console.error('리스너 오류 발생. 다음 리스너로 진행합니다.', error);
          }
        });
      },

      onStompError: (frame) => {
        console.error('❌ 브로커 에러 발생:', frame.headers['message']);
        console.error('상세 내용:', frame.body);
      },

      onWebSocketClose: () => {
        // 현재 SocketManager가 관리하는 중인 최신 소켓과 일치하는지 검증
        if (this.client !== newClient) {
          console.log('👻 과거 세션의 지연된 close 이벤트가 무시되었습니다.');
          return;
        }

        console.log('⚠️ 웹 소켓 연결이 종료되었습니다.');
        this.handleReconnection();
      },
    });

    // 실제 연결 시동
    this.client = newClient;
    this.client.activate();
  }

  /**
   * 소켓 연결 종료 메서드
   */
  public disconnect() {
    if (this.client && this.client.active) {
      // 클라이언트 비활성화
      this.client.deactivate();

      // 각종 설정 초기화
      this.retryCount = 0;
      this.client = null;
      this.currentOptions = DEFAULT_OPTIONS;
      this.connectListeners.clear();

      console.log('🛑 웹 소켓 연결을 수동으로 해제했습니다.');
    }
  }

  /**
   * 특정 채널 구독 (수신)
   * @param destination - 구독할 채널 (e.g., '/chairman/{roomId})
   * @param callback - 메시지를 받을 때마다 해당 메시지에 대해 실행할 콜백 함수
   */
  public subscribe(destination: string, callback: (message: IMessage) => void) {
    if (!this.client || !this.client.connected) {
      console.warn('소켓이 연결되어 있지 않아 구독할 수 없습니다.');
      return null;
    }
    // 구독 객체 반환 (나중에 unsubscribe 할 때 필요함)
    return this.client.subscribe(destination, callback);
  }

  /**
   * 특정 채널로 메시지를 발행(전송)합니다.
   * @param destination - 목적지 채널  (e.g., '/chairman/{roomId})
   * @param body - 전송할 데이터 (객체 형태로 전달하면 내부에서 JSON 문자열로 변환됨)
   * @param headers - 추가적으로 첨부할 STOMP 헤더 (선택 사항)
   */
  public publish(
    destination: string,
    body: SocketMessage,
    headers?: StompHeaders,
  ): void {
    if (!this.client || !this.client.connected) {
      console.warn('소켓이 연결되어 있지 않아 메시지를 보낼 수 없습니다.');
      return;
    }

    this.client.publish({
      destination,
      headers,
      body: JSON.stringify(body),
    });
  }

  /**
   * 내부적으로 연결 재시도를 처리하는 함수
   */
  private handleReconnection() {
    // 클라이언트가 없을 시
    if (!this.client) {
      return;
    }

    // 재시도 횟수를 초과했을 경우 연결을 즉시 종료
    if (this.retryCount >= this.currentOptions.maxRetries) {
      console.error(
        '🚨 최대 재연결 시도 횟수를 초과했습니다. 연결을 포기합니다.',
      );
      this.client.reconnectDelay = 0;

      // 클라이언트 분리
      const clientToDeactivate = this.client;
      this.client = null;
      clientToDeactivate.deactivate();

      return;
    }

    // 아직 재시도 횟수가 남았을 경우, 재시도 딜레이를 갱신
    const nextDelay = this.calculateBackoffDelay(this.retryCount);
    this.client.reconnectDelay = nextDelay;
    this.retryCount++;

    console.log(
      `🔄 재연결 시도 대기 중... (${this.retryCount}/${this.currentOptions.maxRetries}) - ${nextDelay}ms 후 시도`,
    );
  }

  /**
   * 현재 횟수에 따라 재연결 요청 딜레이를 풀 지터 + 지수 백오프 방식으로 계산하는 함수입니다. (0, 최대 딜레이 상한선) 사이 난수를 반환합니다.
   * - `최대 딜레이 상한선 = 기본 재시도 대기 시간 * 2 ^ 현재 재시도 횟수`
   * - 기본 재시도 대기 시간은 소켓 연결 시 `SocketOptions`에서 지정
   * - 현재 재시도 횟수는 소켓 연결 후 인스턴스 수준 변수로 내부에서 관리됨
   * @param currentRetryCount 현재 재시도 횟수
   * @returns 재연결 요청까지 필요한 딜레이 시간
   */
  private calculateBackoffDelay(currentRetryCount: number): number {
    // 최대 지터 상한선 계산
    const maxExponentialDelay =
      this.currentOptions.baseRetryDelayMs * Math.pow(2, currentRetryCount);

    // 난수가 0이 될 경우 STOMP가 재연결 비활성화로 파악하는 것을 막기 위해
    // 계산한 값에 10 ms를 추가
    return Math.floor(Math.random() * maxExponentialDelay) + 10;
  }
}

// 애플리케이션 전역에서 사용할 수 있도록 싱글톤 함수만 노출
export const socketManager = SocketManager.getInstance();
