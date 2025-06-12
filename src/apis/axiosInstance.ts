import axios from 'axios';
import { getAccessToken, setAccessToken } from '../util/accessToken';

axios.defaults.withCredentials = true;
export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE !== 'production'
      ? undefined
      : import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 요청 인터셉터: Access Token을 헤더에 붙여 전송
axiosInstance.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken && config.headers) {
    config.headers.Authorization = `${accessToken}`;
  }
  return config;
});

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
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
