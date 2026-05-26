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
    beforeSend(event, hint) {
      const originalException = hint.originalException;

      // 정상 사용자 흐름(이동/언마운트)에서 자주 생기는 취소성 에러는 노이즈로 간주
      if (originalException instanceof Error) {
        const normalizedMessage = originalException.message.toLowerCase();
        const isCanceledRequest =
          normalizedMessage.includes('cancel') ||
          normalizedMessage.includes('aborted') ||
          originalException.name === 'AbortError' ||
          originalException.name === 'CanceledError';

        if (isCanceledRequest) {
          return null;
        }
      }

      // 크로스 오리진 스크립트 에러는 재현 단서가 부족해 운영 액션 가능성이 낮음
      if (event.exception?.values?.[0]?.value === 'Script error.') {
        return null;
      }

      // 인증 헤더가 extra에 실수로 포함돼도 전송 전에 제거
      if (event.extra && typeof event.extra === 'object') {
        const sanitizedExtra = { ...event.extra };
        delete sanitizedExtra.Authorization;
        event.extra = sanitizedExtra;
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
