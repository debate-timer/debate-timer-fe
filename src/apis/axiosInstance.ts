import axios from 'axios';
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from '../util/accessToken';

// Get current mode (DEV, PROD or TEST)
const currentMode = import.meta.env.MODE;

// Axios instance
export const axiosInstance = axios.create({
  baseURL:
    currentMode === 'test' ? undefined : import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
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
        console.error('Refresh Token is invalid or expired', refreshError);
        // 재발급도 실패하면 -> 로그인 페이지 이동
        window.location.href = '/home';
        removeAccessToken();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
