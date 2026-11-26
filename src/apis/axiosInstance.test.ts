import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios';
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
    localStorage.setItem('accessToken', 'expired-token');
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
      expect.objectContaining({
        withCredentials: true,
        timeout: 10_000,
      }),
    );
  });

  it('비로그인 상태이거나 Authorization 헤더 없이 받은 401에서는 재발급을 요청하지 않는다', async () => {
    server.use(
      http.get('*/api/table/customize/777', () =>
        HttpResponse.json({ message: '인증 필요' }, { status: 401 }),
      ),
    );
    const postSpy = vi.spyOn(axios, 'post');

    await expect(
      axiosInstance.get('/api/table/customize/777'),
    ).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(postSpy).not.toHaveBeenCalled();
  });

  it('요청 당시에는 토큰이 있었으나 응답 시점에 로그아웃된 401에서는 재발급을 요청하지 않는다', async () => {
    localStorage.setItem('accessToken', 'expired-token');
    server.use(
      http.get('*/api/table', () => {
        localStorage.removeItem('accessToken');
        return HttpResponse.json({ message: '인증 필요' }, { status: 401 });
      }),
    );
    const postSpy = vi.spyOn(axios, 'post');

    await expect(axiosInstance.get('/api/table')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(postSpy).not.toHaveBeenCalled();
  });

  it.each(['/api/member', '/api/member/logout', '/api/member/reissue'])(
    '인증 경계 엔드포인트 %s의 401 응답에서는 재발급을 요청하지 않는다',
    async (endpoint) => {
      localStorage.setItem('accessToken', 'expired-token');
      server.use(
        http.post(`*${endpoint}`, () =>
          HttpResponse.json({ message: '인증 실패' }, { status: 401 }),
        ),
      );
      const postSpy = vi.spyOn(axios, 'post');

      await expect(axiosInstance.post(endpoint, null)).rejects.toMatchObject({
        response: { status: 401 },
      });

      expect(postSpy).not.toHaveBeenCalled();
    },
  );

  it('동시에 여러 요청이 401을 받아도 토큰 재발급은 1회만 요청하고 성공 시 모두 새 토큰으로 재시도한다', async () => {
    localStorage.setItem('accessToken', 'expired-token');
    const seenTokens: Record<string, Array<string | null>> = {
      table: [],
      flags: [],
    };
    server.use(
      http.get('*/api/table', ({ request }) => {
        const auth = request.headers.get('Authorization');
        seenTokens.table.push(auth);
        return auth === 'fresh-token'
          ? HttpResponse.json({ tables: [] })
          : HttpResponse.json(null, { status: 401 });
      }),
      http.get('*/api/member/feature-flags', ({ request }) => {
        const auth = request.headers.get('Authorization');
        seenTokens.flags.push(auth);
        return auth === 'fresh-token'
          ? HttpResponse.json({ featureFlags: [] })
          : HttpResponse.json(null, { status: 401 });
      }),
    );

    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const postSpy = vi.spyOn(axios, 'post').mockImplementation(async () => {
      await gate;
      return { headers: { authorization: 'Bearer fresh-token' } };
    });

    const firstRequest = axiosInstance.get('/api/table');
    const secondRequest = axiosInstance.get('/api/member/feature-flags');

    await vi.waitFor(() => expect(postSpy).toHaveBeenCalledTimes(1));
    release();

    const [firstResponse, secondResponse] = await Promise.all([
      firstRequest,
      secondRequest,
    ]);

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(firstResponse.data).toEqual({ tables: [] });
    expect(secondResponse.data).toEqual({ featureFlags: [] });
    expect(seenTokens.table).toEqual(['expired-token', 'fresh-token']);
    expect(seenTokens.flags).toEqual(['expired-token', 'fresh-token']);
    expect(localStorage.getItem('accessToken')).toBe('fresh-token');
  });

  it('동시 401 후 재발급이 401로 실패하면 재발급은 1회만 호출하고 Sentry 수집 없이 인증을 정리한다', async () => {
    localStorage.setItem('accessToken', 'expired-token');
    localStorage.setItem('memberId', '428');
    server.use(
      http.get('*/api/table', () => HttpResponse.json(null, { status: 401 })),
      http.get('*/api/member/feature-flags', () =>
        HttpResponse.json(null, { status: 401 }),
      ),
    );
    const reissueError = new AxiosError(
      'Request failed with status code 401',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: { message: '접근 권한이 없습니다' },
      },
    );
    const postSpy = vi.spyOn(axios, 'post').mockRejectedValue(reissueError);

    const results = await Promise.allSettled([
      axiosInstance.get('/api/table'),
      axiosInstance.get('/api/member/feature-flags'),
    ]);

    expect(results.every((r) => r.status === 'rejected')).toBe(true);
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(captureExceptionMock).not.toHaveBeenCalled();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('memberId')).toBeNull();
  });

  it('동시 401 후 재발급이 500으로 실패하면 Sentry 오류는 1회만 보고한다', async () => {
    localStorage.setItem('accessToken', 'expired-token');
    server.use(
      http.get('*/api/table', () => HttpResponse.json(null, { status: 401 })),
      http.get('*/api/member/feature-flags', () =>
        HttpResponse.json(null, { status: 401 }),
      ),
    );
    const reissueError = new AxiosError(
      'Request failed with status code 500',
      'ERR_BAD_RESPONSE',
      {
        headers: new AxiosHeaders(),
        method: 'post',
        url: '/api/member/reissue',
      },
      undefined,
      {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: { message: '서버 오류' },
      },
    );
    const postSpy = vi.spyOn(axios, 'post').mockRejectedValue(reissueError);

    const results = await Promise.allSettled([
      axiosInstance.get('/api/table'),
      axiosInstance.get('/api/member/feature-flags'),
    ]);

    expect(results.every((r) => r.status === 'rejected')).toBe(true);
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(captureExceptionMock).toHaveBeenCalledTimes(1);
  });

  it('재발급 응답에 새 Access Token이 비어 있으면 빈 토큰을 저장하지 않고 실패 처리한다', async () => {
    localStorage.setItem('accessToken', 'expired-token');
    localStorage.setItem('memberId', '428');
    server.use(
      http.get('*/api/table', () => HttpResponse.json(null, { status: 401 })),
    );
    vi.spyOn(axios, 'post').mockResolvedValue({
      headers: { authorization: '' },
    });

    await expect(axiosInstance.get('/api/table')).rejects.toThrow();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('memberId')).toBeNull();
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
