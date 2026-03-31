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
    // 초기 도입 단계에서는 추적 데이터를 넉넉히 수집하고, 이후 필요 시 낮춤
    tracesSampleRate: 1.0,
    // 일반 세션 Replay는 수집 X
    replaysSessionSampleRate: 0,
    // 에러가 발생한 세션은 모두 Replay로 남김
    replaysOnErrorSampleRate: 1.0,
  });
}
