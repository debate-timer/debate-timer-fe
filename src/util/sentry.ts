import { AxiosError } from 'axios';
import type { SeverityLevel } from '@sentry/react';

export type DebateFeature =
  | 'landing'
  | 'table-list'
  | 'table-composition'
  | 'table-overview'
  | 'timer'
  | 'debate-end'
  | 'vote'
  | 'auth'
  | 'share'
  | 'live-share'
  | 'unknown';

const criticalFeatures: DebateFeature[] = ['timer', 'vote', 'live-share'];
const filteredValue = '[Filtered]';
const sensitiveKeys = [
  'authorization',
  'access_token',
  'accessToken',
  'refresh_token',
  'refreshToken',
  'token',
  'id_token',
  'idToken',
  'code',
  'state',
  'email',
  'password',
  'inviteCode',
];

type SentryCapturedError = {
  __sentry_captured__?: boolean;
};

export type SentryApiErrorMetadata = {
  status: number | undefined;
  statusLabel: string;
  method: string;
  endpoint: string;
  feature: DebateFeature;
  level: SeverityLevel;
  pathname: string;
};

export function normalizeEndpoint(url?: string) {
  if (!url) {
    return 'unknown';
  }

  const path = resolveUrlPath(url);

  return path
    .replace(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,
      ':uuid',
    )
    .replace(/\/[0-9]+(?=\/|$)/g, '/:id');
}

export function resolveFeatureFromPathname(pathname: string): DebateFeature {
  const path = removeLanguagePrefix(pathname);

  if (path === '/home') {
    return 'landing';
  }

  if (path === '/') {
    return 'table-list';
  }

  if (path.startsWith('/composition')) {
    return 'table-composition';
  }

  if (path.startsWith('/overview')) {
    return 'table-overview';
  }

  if (path.includes('/end/vote') || path.startsWith('/vote')) {
    return 'vote';
  }

  if (path.includes('/end/feedback')) {
    return 'timer';
  }

  if (path.includes('/end')) {
    return 'debate-end';
  }

  if (path.startsWith('/table/customize')) {
    return 'timer';
  }

  if (path.startsWith('/oauth')) {
    return 'auth';
  }

  if (path.startsWith('/share')) {
    return 'share';
  }

  if (path.startsWith('/live')) {
    return 'live-share';
  }

  return 'unknown';
}

export function resolveApiErrorLevel(
  status: number | undefined,
  feature: DebateFeature,
): SeverityLevel {
  if (status === 400 || status === 404 || status === 409 || status === 422) {
    return 'warning';
  }

  if (
    status !== undefined &&
    status >= 500 &&
    criticalFeatures.includes(feature)
  ) {
    return 'fatal';
  }

  return 'error';
}

export function shouldSkipApiError(error: AxiosError) {
  const status = error.response?.status;

  if (status === 401 || (status !== undefined && status < 400)) {
    return true;
  }

  return isOfflineNetworkError(error.code);
}

export function buildSentryApiErrorMetadata(
  error: AxiosError,
  pathname: string,
): SentryApiErrorMetadata {
  const status = error.response?.status;
  const method = error.config?.method?.toUpperCase() ?? 'UNKNOWN';
  const endpoint = normalizeEndpoint(error.config?.url);
  const feature = resolveFeatureFromPathname(pathname);

  return {
    status,
    statusLabel: status ? String(status) : 'network-error',
    method,
    endpoint,
    feature,
    level: resolveApiErrorLevel(status, feature),
    pathname,
  };
}

export function createSentryApiError(
  error: AxiosError,
  metadata: SentryApiErrorMetadata,
) {
  const sentryError = new Error(error.message);
  sentryError.name = `${metadata.level} · api-error · ${metadata.feature} · [${metadata.statusLabel}] ${metadata.method} ${metadata.endpoint}`;
  sentryError.stack = error.stack;
  (sentryError as SentryCapturedError).__sentry_captured__ = true;

  return sentryError;
}

export function markSentryCaptured(error: unknown) {
  if (typeof error === 'object' && error !== null) {
    (error as SentryCapturedError).__sentry_captured__ = true;
  }
}

export function isSentryCaptured(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as SentryCapturedError).__sentry_captured__ === true
  );
}

export function sanitizeSentrySearch(search: string) {
  if (!search) {
    return '';
  }

  const params = new URLSearchParams(search);
  params.forEach((_, key) => {
    if (isSensitiveKey(key)) {
      params.set(key, filteredValue);
    }
  });

  const sanitizedSearch = params.toString();

  return sanitizedSearch ? `?${sanitizedSearch}` : '';
}

export function sanitizeSentryContext(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeSentryContext);
  }

  if (typeof value !== 'object' || value === null) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      key,
      isSensitiveKey(key) ? filteredValue : sanitizeSentryContext(nestedValue),
    ]),
  );
}

function resolveUrlPath(url: string) {
  try {
    return new URL(url, window.location.origin).pathname;
  } catch {
    return url.split('?')[0] || 'unknown';
  }
}

function removeLanguagePrefix(pathname: string) {
  const path = pathname.replace(/^\/(ko|en)(?=\/|$)/, '');

  return path === '' ? '/' : path;
}

function isOfflineNetworkError(code?: string) {
  return (
    typeof navigator !== 'undefined' &&
    navigator.onLine === false &&
    (code === 'ERR_NETWORK' || code === 'ECONNABORTED' || code === 'ETIMEDOUT')
  );
}

function isSensitiveKey(key: string) {
  return sensitiveKeys.some(
    (sensitiveKey) => sensitiveKey.toLowerCase() === key.toLowerCase(),
  );
}
