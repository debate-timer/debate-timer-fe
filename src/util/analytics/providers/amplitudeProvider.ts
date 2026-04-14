import * as amplitude from '@amplitude/analytics-browser';
import type {
  AnalyticsEventMap,
  AnalyticsEventName,
  AnalyticsProvider,
  AnalyticsUserProperties,
  EnrichedEventProperties,
  PageViewProperties,
} from '../types';

/** Amplitude SDK 호출을 프로젝트 공통 인터페이스로 감싸는 provider다. */
export class AmplitudeProvider implements AnalyticsProvider {
  readonly name = 'Amplitude';

  /**
   * Amplitude 초기화에 필요한 API 키를 보관한다.
   * `apiKey`는 Amplitude 프로젝트 API 키이며 반환값은 없다.
   */
  constructor(private apiKey: string) {}

  /**
   * Amplitude SDK를 API 키로 초기화한다.
   * 파라미터는 받지 않으며, 반환값은 없다.
   */
  init(): void {
    amplitude.init(this.apiKey);
  }

  /**
   * 페이지뷰 이벤트를 Amplitude에 전송한다.
   * `properties`는 공통 필드가 포함된 페이지뷰 속성이며 반환값은 없다.
   */
  trackPageView(properties: EnrichedEventProperties<PageViewProperties>): void {
    amplitude.track('page_view', properties);
  }

  /**
   * 임의의 애널리틱스 이벤트를 Amplitude에 전송한다.
   * `eventName`은 이벤트 이름, `properties`는 공통 필드가 포함된 이벤트 속성이며 반환값은 없다.
   */
  trackEvent<T extends AnalyticsEventName>(
    eventName: T,
    properties: EnrichedEventProperties<AnalyticsEventMap[T]>,
  ): void {
    amplitude.track(eventName, properties);
  }

  /**
   * Amplitude 사용자 식별자를 설정한다.
   * `userId`는 서비스 사용자 ID이며, 반환값은 없다.
   */
  setUserId(userId: string): void {
    amplitude.setUserId(`user_${userId}`);
  }

  /**
   * 사용자 속성을 Identify 객체로 만들어 Amplitude에 반영한다.
   * `properties`는 사용자 유형과 언어 등의 속성이며 반환값은 없다.
   */
  setUserProperties(properties: AnalyticsUserProperties): void {
    const identify = new amplitude.Identify();
    Object.entries(properties).forEach(([key, value]) => {
      identify.set(key, value);
    });
    amplitude.identify(identify);
  }

  /**
   * Amplitude에 저장된 사용자 상태를 초기화한다.
   * 파라미터는 받지 않으며, 반환값은 없다.
   */
  reset(): void {
    amplitude.reset();
  }

  /**
   * 대기 중인 Amplitude 이벤트 전송을 요청한다.
   * 파라미터는 받지 않으며, 반환값은 없다.
   */
  flush(): void {
    amplitude.flush();
  }
}
