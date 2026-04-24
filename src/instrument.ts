import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;

if (import.meta.env.PROD && dsn) {
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
  });
}
