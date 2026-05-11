import { useCallback } from 'react';
import { analyticsManager } from '../util/analytics';
import type {
  AnalyticsEventMap,
  AnalyticsEventName,
  PageViewProperties,
} from '../util/analytics/types';
import { DEFAULT_LANG } from '../util/languageRouting';

export default function useAnalytics() {
  const trackEvent = useCallback(
    <T extends AnalyticsEventName>(
      eventName: T,
      properties: AnalyticsEventMap[T],
    ) => {
      analyticsManager.trackEvent(eventName, properties);
    },
    [],
  );

  const trackPageView = useCallback((properties: PageViewProperties) => {
    analyticsManager.trackPageView(properties);
  }, []);

  const identifyUser = useCallback((memberId: number) => {
    analyticsManager.setUserId(String(memberId));
    analyticsManager.setUserProperties({
      user_type: 'member',
      language: document.documentElement.lang || DEFAULT_LANG,
    });
  }, []);

  const resetUser = useCallback(() => {
    analyticsManager.reset();
  }, []);

  const flush = useCallback(() => {
    analyticsManager.flush();
  }, []);

  return { trackEvent, trackPageView, identifyUser, resetUser, flush };
}
