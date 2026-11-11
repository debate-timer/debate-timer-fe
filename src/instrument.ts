import * as Sentry from '@sentry/react';
import {
  resolveSentryAllowUrls,
  sanitizeSentryRequest,
  shouldSkipSentryEvent,
} from './util/sentry';

const dsn = import.meta.env.VITE_SENTRY_DSN;
const isSentryEnabled =
  import.meta.env.PROD || import.meta.env.VITE_ENABLE_SENTRY === 'true';

if (isSentryEnabled && dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [
      // 페이지 로드와 라우트 이동 등의 성능 흐름 추적
      Sentry.browserTracingIntegration(),
      // 에러가 발생한 세션만 Replay로 남기고, 개인 정보 가림
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // 백엔드는 Datadog를 사용 중이므로, 프론트 단독 성능 추적만 낮은 비율로 수집
    tracesSampleRate: 0.1,
    // 일반 세션 Replay는 수집 X
    replaysSessionSampleRate: 0,
    // 에러가 발생한 세션은 모두 Replay로 남김
    replaysOnErrorSampleRate: 1.0,
    // 앱 번들에서 난 에러만 수집 (브라우저 주입 스크립트, Google AdSense 스크립트 에러 제외)
    allowUrls: resolveSentryAllowUrls(
      window.location.origin,
      import.meta.env.BASE_URL,
      import.meta.env.PROD,
    ),
    beforeSend(event, hint) {
      const originalException = hint?.originalException;

      // 이미 수집한 API 에러, 취소성 에러, 원인 추적이 어려운 Script error는 전송하지 않음
      if (
        shouldSkipSentryEvent(
          originalException,
          event.exception?.values?.[0]?.value,
        )
      ) {
        return null;
      }

      // 인증 헤더가 extra에 실수로 포함돼도 전송 전에 제거
      if (event.extra && typeof event.extra === 'object') {
        const sanitizedExtra = { ...event.extra };
        delete sanitizedExtra.Authorization;
        delete sanitizedExtra.authorization;
        event.extra = sanitizedExtra;
      }

      // 현재 페이지 주소의 OAuth 인가 코드 같은 민감 query를 전송 전에 가림
      if (event.request) {
        event.request = sanitizeSentryRequest(event.request);
      }

      return event;
    },
    initialScope: {
      tags: {
        language: document.documentElement.lang || 'ko',
      },
    },
  });
}
