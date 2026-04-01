import axios from 'axios';
import * as Sentry from '@sentry/react';
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from '../util/accessToken';
import i18n from '../i18n';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../util/languageRouting';

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

  const { response, config, code } = error;
  const status = response?.status;

  // 401 재발급 흐름과 정상/리다이렉트 응답만 제외하고, 4xx/5xx/네트워크 실패/타임아웃은 수집
  if (status === 401 || (status !== undefined && status < 400)) {
    return;
  }

  Sentry.captureException(error, {
    tags: {
      errorType: 'api-error',
      httpStatus: status ? String(status) : 'network-error',
    },
    extra: {
      url: config?.url,
      method: config?.method,
      baseURL: config?.baseURL,
      params: config?.params,
      requestData: config?.data,
      responseData: response?.data,
      timeout: config?.timeout ?? requestTimeoutMs,
      errorCode: code,
    },
  });
}

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        // Refresh Token은 HttpOnly 쿠키에 있다고 가정 (JS 접근 X)
        // => withCredentials로 자동 전송되거나, 백엔드가 쿠키로 다룸
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/member/reissue`,
          null,
        );

        // **새 Access Token은 응답 헤더(Authorization)에 담겨 있다고 가정**
        const headerAuth = refreshResponse.headers['authorization'] || '';

        // Authorization: Bearer <새토큰> 형태라면 "Bearer " 부분 제거
        const newAccessToken = headerAuth.replace(/^Bearer\s+/i, '').trim();

        // 로컬 스토리지에 저장
        setAccessToken(newAccessToken);

        // 원본 요청 헤더도 새 토큰으로 교체 후 재요청
        originalRequest.headers.Authorization = `${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
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
        window.location.href = buildLangPath('/home', lang);
        removeAccessToken();
        return Promise.reject(refreshError);
      }
    }

    captureClientApiError(error);

    return Promise.reject(error);
  },
);

export default axiosInstance;
