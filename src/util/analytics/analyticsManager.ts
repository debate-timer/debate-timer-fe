import { isLoggedIn } from '../accessToken';
import { DEFAULT_LANG } from '../languageRouting';
import type {
  AnalyticsEventMap,
  AnalyticsEventName,
  AnalyticsManagerInterface,
  AnalyticsProvider,
  AnalyticsUserProperties,
  GlobalEventProperties,
  PageViewProperties,
} from './types';

/** 공통 이벤트 필드를 합성해 등록된 모든 provider에 전파하는 애널리틱스 매니저다. */
export class AnalyticsManager implements AnalyticsManagerInterface {
  private providers: AnalyticsProvider[] = [];

  /**
   * 이벤트를 전달할 provider를 등록한다.
   * `provider`는 `AnalyticsProvider` 구현체이며, 반환값은 없다.
   */
  addProvider(provider: AnalyticsProvider): void {
    this.providers.push(provider);
  }

  /**
   * 등록된 모든 provider의 초기화를 순차적으로 실행한다.
   * 파라미터는 받지 않으며, 반환값은 없다.
   */
  init(): void {
    this.providers.forEach((p) => this.safeCall(p, () => p.init()));
  }

  /**
   * 페이지뷰 속성에 공통 필드를 합성해 모든 provider로 전달한다.
   * `properties`는 페이지 제목, 이전 경로, referrer 등을 담으며 반환값은 없다.
   */
  trackPageView(properties: PageViewProperties): void {
    const enriched = { ...this.getGlobalProperties(), ...properties };
    this.providers.forEach((p) =>
      this.safeCall(p, () => p.trackPageView(enriched)),
    );
  }

  /**
   * 이벤트 속성에 공통 필드를 합성해 모든 provider로 전달한다.
   * `eventName`은 이벤트 이름, `properties`는 해당 이벤트 전용 속성이며 반환값은 없다.
   */
  trackEvent<T extends AnalyticsEventName>(
    eventName: T,
    properties: AnalyticsEventMap[T],
  ): void {
    const enriched = { ...this.getGlobalProperties(), ...properties };
    this.providers.forEach((p) =>
      this.safeCall(p, () => p.trackEvent(eventName, enriched)),
    );
  }

  /**
   * 등록된 모든 provider에 사용자 식별자를 설정한다.
   * `userId`는 사용자 식별 문자열이며, 반환값은 없다.
   */
  setUserId(userId: string): void {
    this.providers.forEach((p) => this.safeCall(p, () => p.setUserId(userId)));
  }

  /**
   * 등록된 모든 provider에 사용자 속성을 설정한다.
   * `properties`는 사용자 유형과 언어 정보를 담으며, 반환값은 없다.
   */
  setUserProperties(properties: AnalyticsUserProperties): void {
    this.providers.forEach((p) =>
      this.safeCall(p, () => p.setUserProperties(properties)),
    );
  }

  /**
   * 등록된 모든 provider의 사용자 상태를 초기화한다.
   * 파라미터는 받지 않으며, 반환값은 없다.
   */
  reset(): void {
    this.providers.forEach((p) => this.safeCall(p, () => p.reset()));
  }

  /**
   * 등록된 모든 provider의 대기 중인 이벤트 전송을 요청한다.
   * 파라미터는 받지 않으며, 반환값은 없다.
   */
  flush(): void {
    this.providers.forEach((p) => this.safeCall(p, () => p.flush()));
  }

  /**
   * 현재 로그인 상태와 문서 정보를 기반으로 공통 이벤트 속성을 만든다.
   * 파라미터는 받지 않으며, 사용자 유형, 언어, 현재 경로를 담은 객체를 반환한다.
   */
  private getGlobalProperties(): GlobalEventProperties {
    return {
      user_type: isLoggedIn() ? 'member' : 'guest',
      language: document.documentElement.lang || DEFAULT_LANG,
      page_path: window.location.pathname,
    };
  }

  /**
   * provider 호출 중 발생한 예외를 삼켜 다른 provider 전파에 영향이 없도록 한다.
   * `provider`는 에러 로그 식별용 대상, `fn`은 실행할 작업이며 반환값은 없다.
   */
  private safeCall(provider: AnalyticsProvider, fn: () => void): void {
    try {
      fn();
    } catch (error) {
      console.error(`[Analytics] ${provider.name} error:`, error);
    }
  }
}
