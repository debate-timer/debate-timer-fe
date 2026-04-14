import { AnalyticsManager } from './analyticsManager';
import { AmplitudeProvider } from './providers/amplitudeProvider';
import { GA4Provider } from './providers/ga4Provider';
import { NoopProvider } from './providers/noopProvider';

export type {
  AnalyticsEventMap,
  AnalyticsEventName,
  AnalyticsManagerInterface,
  AnalyticsProvider,
  AnalyticsUserProperties,
  GlobalEventProperties,
} from './types';
export { ANALYTICS_EVENTS } from './constants';

/** 애널리틱스 제공자들을 통합 관리하는 전역 매니저 인스턴스다. */
const analyticsManager = new AnalyticsManager();

/**
 * 실행 환경에 맞는 애널리틱스 provider를 등록하고 초기화한다.
 * 파라미터는 받지 않으며, 반환값은 없다.
 */
export function setupAnalytics(): void {
  const isProduction = import.meta.env.MODE === 'production';
  if (isProduction) {
    const amplitudeKey = import.meta.env.VITE_AMPLITUDE_API_KEY;
    if (amplitudeKey) {
      analyticsManager.addProvider(new AmplitudeProvider(amplitudeKey));
    }

    const gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
    if (gaId) {
      analyticsManager.addProvider(new GA4Provider(gaId));
    }
  } else {
    analyticsManager.addProvider(new NoopProvider());
  }

  analyticsManager.init();
}

export { analyticsManager };
