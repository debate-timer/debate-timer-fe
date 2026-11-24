import { APIError } from '../apis/primitives';
import { shouldRetryQueryError } from './queryRetry';

describe('QueryClient 기본 재시도 정책', () => {
  it('Axios가 이미 처리한 타임아웃과 네트워크 오류는 Query 레벨에서 중복 재시도하지 않는다', () => {
    expect(
      shouldRetryQueryError(
        0,
        new APIError('timeout', 500, undefined, 'ECONNABORTED'),
      ),
    ).toBe(false);
    expect(
      shouldRetryQueryError(
        0,
        new APIError('timeout', 500, undefined, 'ETIMEDOUT'),
      ),
    ).toBe(false);
    expect(
      shouldRetryQueryError(
        0,
        new APIError('Network Error', 500, undefined, 'ERR_NETWORK'),
      ),
    ).toBe(false);
  });

  it('4xx 클라이언트 오류는 Query 레벨에서 재시도하지 않는다', () => {
    expect(
      shouldRetryQueryError(0, new APIError('Bad Request', 400, null)),
    ).toBe(false);
    expect(shouldRetryQueryError(0, new APIError('Not Found', 404, null))).toBe(
      false,
    );
  });

  it('5xx 서버 오류와 일반 오류는 최대 3회까지 재시도한다', () => {
    const serverError = new APIError(
      'Server Error',
      500,
      null,
      'ERR_BAD_RESPONSE',
    );

    expect(shouldRetryQueryError(0, serverError)).toBe(true);
    expect(shouldRetryQueryError(2, serverError)).toBe(true);
    expect(shouldRetryQueryError(3, serverError)).toBe(false);

    expect(shouldRetryQueryError(0, new Error('unexpected'))).toBe(true);
    expect(shouldRetryQueryError(3, new Error('unexpected'))).toBe(false);
  });
});
