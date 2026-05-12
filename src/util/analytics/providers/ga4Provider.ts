import ReactGA from 'react-ga4';
import type {
  AnalyticsEventMap,
  AnalyticsEventName,
  AnalyticsProvider,
  AnalyticsUserProperties,
  EnrichedEventProperties,
  PageViewProperties,
} from '../types';

/** React GA4 SDK 호출을 프로젝트 공통 인터페이스로 감싸는 provider다. */
export class GA4Provider implements AnalyticsProvider {
  readonly name = 'GA4';

  /**
   * GA4 초기화에 필요한 측정 ID를 보관한다.
   * `gaId`는 Google Analytics 측정 ID이며 반환값은 없다.
   */
  constructor(private gaId: string) {}

  /**
   * GA4 SDK를 측정 ID로 초기화한다.
   * 파라미터는 받지 않으며, 반환값은 없다.
   */
  init(): void {
    ReactGA.initialize(this.gaId);
  }

  /**
   * 페이지뷰 속성을 GA4 pageview 형식으로 변환해 전송한다.
   * `properties`는 공통 필드가 포함된 페이지뷰 속성이며 반환값은 없다.
   */
  trackPageView(properties: EnrichedEventProperties<PageViewProperties>): void {
    ReactGA.send({
      hitType: 'pageview',
      page: properties.page_path,
      title: properties.page_title,
    });
  }

  /**
   * 임의의 애널리틱스 이벤트를 GA4에 전송한다.
   * `eventName`은 이벤트 이름, `properties`는 공통 필드가 포함된 이벤트 속성이며 반환값은 없다.
   */
  trackEvent<T extends AnalyticsEventName>(
    eventName: T,
    properties: EnrichedEventProperties<AnalyticsEventMap[T]>,
  ): void {
    ReactGA.event(eventName, properties);
  }

  /**
   * GA4에 사용자 식별자를 설정한다.
   * `userId`는 서비스 사용자 ID이며, 반환값은 없다.
   */
  setUserId(userId: string): void {
    ReactGA.set({ user_id: userId });
  }

  /**
   * GA4에서는 사용자 속성을 직접 처리하지 않으므로 빈 구현으로 둔다.
   * `_properties`는 맞춰진 인터페이스용 파라미터이며 반환값은 없다.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setUserProperties(_properties: AnalyticsUserProperties): void {
    // GA4 handles user properties via gtag config, not directly
  }

  /**
   * GA4에 설정된 사용자 식별자를 초기화한다.
   * 파라미터는 받지 않으며, 반환값은 없다.
   */
  reset(): void {
    ReactGA.set({ user_id: null });
  }

  /**
   * GA4는 즉시 전송 방식이므로 별도 flush 동작 없이 종료한다.
   * 파라미터는 받지 않으며, 반환값은 없다.
   */
  flush(): void {
    // GA4 sends events immediately, no flush needed
  }
}
