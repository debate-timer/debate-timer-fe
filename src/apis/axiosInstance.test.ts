import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { axiosInstance } from './axiosInstance';

const captureExceptionMock = vi.fn();

vi.mock('@sentry/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sentry/react')>();
  return {
    ...actual,
    captureException: (...args: unknown[]) => captureExceptionMock(...args),
  };
});

function createTimeoutError(
  config: InternalAxiosRequestConfig,
  code: 'ECONNABORTED' | 'ETIMEDOUT' = 'ECONNABORTED',
) {
  return new AxiosError(
    '시간 초과로 인해 요청을 처리하지 못했어요... 잠시 후 다시 시도해 주세요.',
    code,
    config,
  );
}

describe('axiosInstance 응답 인터셉터', () => {
  beforeEach(() => {
    captureExceptionMock.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('기본 요청 타임아웃을 10초로 설정한다', () => {
    expect(axiosInstance.defaults.timeout).toBe(10_000);
  });

  it('401 응답을 받으면 refresh token 쿠키가 실리도록 withCredentials를 켜고 재발급을 요청한다', async () => {
    server.use(
      http.get('*/api/reissue-target', () =>
        HttpResponse.json(null, { status: 401 }),
      ),
    );
    const postSpy = vi
      .spyOn(axios, 'post')
      .mockRejectedValue(new Error('reissue failed'));

    await expect(axiosInstance.get('/api/reissue-target')).rejects.toThrow(
      'reissue failed',
    );

    expect(postSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/member/reissue'),
      null,
      expect.objectContaining({ withCredentials: true }),
    );
  });

  it('GET 요청이 첫 시도에서 타임아웃되면 1회 자동 재시도해 복구하고 Sentry에 보고하지 않는다', async () => {
    let attempts = 0;

    const response = await axiosInstance.get('/api/timeout-recover', {
      adapter: async (config) => {
        attempts += 1;
        if (attempts === 1) {
          throw createTimeoutError(config);
        }
        return {
          data: { ok: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      },
    });

    expect(response.data).toEqual({ ok: true });
    expect(attempts).toBe(2);
    expect(captureExceptionMock).not.toHaveBeenCalled();
  });

  it('GET 요청이 재시도까지 연속 타임아웃되면 최대 1회만 재시도하고 Sentry에 1회만 보고한다', async () => {
    let attempts = 0;

    await expect(
      axiosInstance.get('/api/timeout-fail', {
        adapter: async (config) => {
          attempts += 1;
          throw createTimeoutError(config);
        },
      }),
    ).rejects.toMatchObject({ code: 'ECONNABORTED' });

    expect(attempts).toBe(2);
    expect(captureExceptionMock).toHaveBeenCalledTimes(1);
  });

  it.each(['post', 'put', 'patch', 'delete'] as const)(
    '%s 요청은 타임아웃이 발생해도 자동 재시도하지 않는다',
    async (method) => {
      let attempts = 0;

      await expect(
        axiosInstance.request({
          method,
          url: '/api/non-get-timeout',
          adapter: async (config) => {
            attempts += 1;
            throw createTimeoutError(config);
          },
        }),
      ).rejects.toMatchObject({ code: 'ECONNABORTED' });

      expect(attempts).toBe(1);
      expect(captureExceptionMock).toHaveBeenCalledTimes(1);
    },
  );

  it.each([400, 404, 500])(
    'GET 요청이 HTTP %s 응답을 받으면 자동 재시도하지 않는다',
    async (status) => {
      let attempts = 0;
      server.use(
        http.get('*/api/http-error-no-retry', () => {
          attempts += 1;
          return HttpResponse.json({ message: 'error' }, { status });
        }),
      );

      await expect(
        axiosInstance.get('/api/http-error-no-retry'),
      ).rejects.toMatchObject({
        response: { status },
      });

      expect(attempts).toBe(1);
    },
  );

  it('오프라인 상태에서는 GET 타임아웃이 발생해도 자동 재시도하지 않는다', async () => {
    let attempts = 0;
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    await expect(
      axiosInstance.get('/api/offline-timeout', {
        adapter: async (config) => {
          attempts += 1;
          throw createTimeoutError(config);
        },
      }),
    ).rejects.toMatchObject({ code: 'ECONNABORTED' });

    expect(attempts).toBe(1);
    expect(captureExceptionMock).not.toHaveBeenCalled();
  });

  it('계정 결속 GET 요청의 첫 시도 타임아웃 대기 중 계정이 전환되면 재시도하지 않고 취소한다', async () => {
    localStorage.setItem('memberId', '1');
    localStorage.setItem('accessToken', 'token-a');
    let attempts = 0;

    await expect(
      axiosInstance.get('/api/account-bound-timeout', {
        expectedMemberId: '1',
        adapter: async (config) => {
          attempts += 1;
          localStorage.setItem('memberId', '2');
          localStorage.setItem('accessToken', 'token-b');
          throw createTimeoutError(config);
        },
      }),
    ).rejects.toMatchObject({ code: 'ERR_CANCELED' });

    expect(attempts).toBe(1);
    expect(captureExceptionMock).not.toHaveBeenCalled();
  });

  it('같은 계정의 expectedMemberId가 설정된 GET 요청은 타임아웃이 발생해도 자동 재시도하지 않는다', async () => {
    localStorage.setItem('memberId', '1');
    localStorage.setItem('accessToken', 'token-a');
    let attempts = 0;

    await expect(
      axiosInstance.get('/api/member/settings', {
        expectedMemberId: '1',
        adapter: async (config) => {
          attempts += 1;
          throw createTimeoutError(config);
        },
      }),
    ).rejects.toMatchObject({ code: 'ECONNABORTED' });

    expect(attempts).toBe(1);
    expect(captureExceptionMock).toHaveBeenCalledTimes(1);
  });
});
