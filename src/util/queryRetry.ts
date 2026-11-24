import { APIError } from '../apis/primitives';

const DEFAULT_QUERY_RETRY_COUNT = 3;
const NON_RETRYABLE_ERROR_CODES = new Set([
  'ECONNABORTED',
  'ETIMEDOUT',
  'ERR_NETWORK',
]);

/**
 * Axios 인터셉터에서 이미 처리한 타임아웃·네트워크 오류와 4xx 클라이언트 오류는
 * TanStack Query 레벨에서 중복 재시도하지 않도록 걸러냄.
 */
export function shouldRetryQueryError(
  failureCount: number,
  error: unknown,
): boolean {
  if (failureCount >= DEFAULT_QUERY_RETRY_COUNT) {
    return false;
  }

  if (error instanceof APIError) {
    if (error.code && NON_RETRYABLE_ERROR_CODES.has(error.code)) {
      return false;
    }

    if (error.status >= 400 && error.status < 500) {
      return false;
    }
  }

  return true;
}
