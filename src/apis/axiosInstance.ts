import axios, { InternalAxiosRequestConfig, CanceledError } from 'axios';
import * as Sentry from '@sentry/react';
import {
  getAccessToken,
  getAuthRevision,
  getMemberId,
  removeAccessToken,
  removeMemberId,
  setAccessToken,
} from '../util/accessToken';
import i18n from '../i18n';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../util/languageRouting';
import { analyticsManager } from '../util/analytics';
import {
  buildSentryApiErrorMetadata,
  createSentryApiError,
  markSentryCaptured,
  sanitizeSentryContext,
  sanitizeSentrySearch,
  sanitizeSentryUrl,
  shouldSkipApiError,
} from '../util/sentry';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** 서버에 전송하지 않는 요청 시작 계정 식별자임. */
    expectedMemberId?: string;
    expectedAuthRevision?: number;
  }
}

function assertRequestAccount(config?: InternalAxiosRequestConfig): void {
  if (
    config?.expectedMemberId !== undefined &&
    (getMemberId() !== config.expectedMemberId ||
      !getAccessToken() ||
      (config.expectedAuthRevision !== undefined &&
        config.expectedAuthRevision !== getAuthRevision()))
  ) {
    throw new CanceledError('MEMBER_SETTINGS_ACCOUNT_CHANGED', config);
  }
}

// Get current mode (DEV, PROD or TEST)
const currentMode = import.meta.env.MODE;
const requestTimeoutMs = 5000;

// Axios instance
export const axiosInstance = axios.create({
  baseURL:
    currentMode === 'test' ? undefined : import.meta.env.VITE_API_BASE_URL,
  timeout: requestTimeoutMs,
  timeoutErrorMessage:
    '시간 초과로 인해 요청을 처리하지 못했어요... 잠시 후 다시 시도해 주세요.',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
axiosInstance.interceptors.request.use((config) => {
  assertRequestAccount(config);
  const accessToken = getAccessToken();

  // Access token을 헤더에 붙여 전송
  if (accessToken && config.headers) {
    config.headers.Authorization = `${accessToken}`;
  }
  return config;
});

function captureClientApiError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return;
  }

  if (shouldSkipApiError(error)) {
    return;
  }

  const metadata = buildSentryApiErrorMetadata(error, window.location.pathname);
  const sentryError = createSentryApiError(error, metadata);

  Sentry.withScope((scope) => {
    scope.setLevel(metadata.level);
    scope.setTags({
      errorType: 'api-error',
      httpStatus: metadata.statusLabel,
      endpoint: `${metadata.method} ${metadata.endpoint}`,
      feature: metadata.feature,
    });
    scope.setContext('request', {
      pathname: metadata.pathname,
      search: sanitizeSentrySearch(window.location.search),
      url: sanitizeSentryUrl(error.config?.url),
      method: error.config?.method,
      params: sanitizeSentryContext(error.config?.params),
      timeout: error.config?.timeout ?? requestTimeoutMs,
      errorCode: error.code,
    });
    scope.setContext('response', {
      status: metadata.status,
      data: sanitizeSentryContext(error.response?.data),
    });
    scope.setFingerprint([
      'api-error',
      metadata.statusLabel,
      metadata.method,
      metadata.endpoint,
    ]);

    Sentry.captureException(sentryError);
  });

  markSentryCaptured(error);
}

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    assertRequestAccount(response.config);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    assertRequestAccount(originalRequest);
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        // Refresh Token은 API 도메인 쿠키에 있으므로
        // 교차 출처 요청에도 쿠키가 실리도록 withCredentials를 명시
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/member/reissue`,
          null,
          { withCredentials: true },
        );

        // 재발급 대기 중 전환한 계정의 인증 상태와 서버 데이터를 보호함.
        assertRequestAccount(originalRequest);

        // 새 Access Token은 응답 헤더(Authorization)에 담겨 있다고 가정
        const headerAuth = refreshResponse.headers['authorization'] || '';

        // Authorization: Bearer <새토큰> 형태라면 "Bearer " 부분 제거
        const newAccessToken = headerAuth.replace(/^Bearer\s+/i, '').trim();

        // 로컬 스토리지에 저장
        setAccessToken(newAccessToken);

        // 원본 요청 헤더도 새 토큰으로 교체 후 재요청
        originalRequest.headers.Authorization = `${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        assertRequestAccount(originalRequest);
        if (
          axios.isAxiosError(refreshError) &&
          refreshError.response?.status !== 401 &&
          refreshError.response?.status !== 403
        ) {
          captureClientApiError(refreshError);
        }

        console.error('Refresh Token is invalid or expired', refreshError);
        // 재발급도 실패하면 -> 로그인 페이지 이동
        const currentLang = i18n.resolvedLanguage ?? i18n.language;
        const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;
        Sentry.setUser(null);
        removeAccessToken();
        removeMemberId();
        window.location.href = buildLangPath('/', lang);
        analyticsManager.reset();
        return Promise.reject(refreshError);
      }
    }

    captureClientApiError(error);

    return Promise.reject(error);
  },
);

export default axiosInstance;
