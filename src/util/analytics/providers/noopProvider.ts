import type { AnalyticsProvider } from '../types';

/** 실제 SDK 없이 동일한 인터페이스를 만족시키는 no-op provider다. */
export class NoopProvider implements AnalyticsProvider {
  readonly name = 'Noop';

  /**
   * 개발 환경에서 초기화 호출만 흡수한다.
   * 파라미터는 받지 않으며, 반환값은 없다.
   */
  init(): void {}
  /**
   * 개발 환경에서 페이지뷰 전송 호출만 흡수한다.
   * 파라미터는 받지 않으며, 반환값은 없다.
   */
  trackPageView(): void {}
  /**
   * 개발 환경에서 이벤트 전송 호출만 흡수한다.
   * 파라미터는 받지 않으며, 반환값은 없다.
   */
  trackEvent(): void {}
  /**
   * 개발 환경에서 사용자 ID 설정 호출만 흡수한다.
   * 파라미터는 받지 않으며, 반환값은 없다.
   */
  setUserId(): void {}
  /**
   * 개발 환경에서 사용자 속성 설정 호출만 흡수한다.
   * 파라미터는 받지 않으며, 반환값은 없다.
   */
  setUserProperties(): void {}
  /**
   * 개발 환경에서 상태 초기화 호출만 흡수한다.
   * 파라미터는 받지 않으며, 반환값은 없다.
   */
  reset(): void {}
  /**
   * 개발 환경에서 flush 호출만 흡수한다.
   * 파라미터는 받지 않으며, 반환값은 없다.
   */
  flush(): void {}
}
