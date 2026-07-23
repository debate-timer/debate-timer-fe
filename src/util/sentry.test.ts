import { AxiosError, AxiosHeaders } from 'axios';
import {
  buildSentryApiErrorMetadata,
  createSentryApiError,
  normalizeEndpoint,
  resolveApiErrorLevel,
  resolveFeatureFromPathname,
  sanitizeSentryContext,
  sanitizeSentrySearch,
  shouldSkipApiError,
} from './sentry';

describe('sentry 유틸', () => {
  it('같은 API 장애가 하나의 알림 이슈로 묶이도록 가변 경로 값을 제거한다', () => {
    expect(normalizeEndpoint('/api/tables/123/votes/456?tab=1')).toBe(
      '/api/tables/:id/votes/:id',
    );
    expect(
      normalizeEndpoint(
        'https://example.com/api/tables/9e770d72-7a5d-4fd7-8c4e-7cf6115a1f6b',
      ),
    ).toBe('/api/tables/:uuid');
  });

  it('알림만 보고 사용자에게 영향받은 기능을 판단할 수 있도록 pathname을 기능 단위로 분류한다', () => {
    expect(resolveFeatureFromPathname('/ko/home')).toBe('landing');
    expect(resolveFeatureFromPathname('/en/table/customize/1')).toBe('timer');
    expect(resolveFeatureFromPathname('/composition')).toBe(
      'table-composition',
    );
    expect(resolveFeatureFromPathname('/overview/customize/1')).toBe(
      'table-overview',
    );
    expect(resolveFeatureFromPathname('/table/customize/1/end')).toBe(
      'debate-end',
    );
    expect(resolveFeatureFromPathname('/table/customize/1/end/vote/2')).toBe(
      'vote',
    );
    expect(resolveFeatureFromPathname('/live/1')).toBe('live-share');
    expect(resolveFeatureFromPathname('/oauth')).toBe('auth');
  });

  it('유사 접두사 경로가 실제 기능 경로로 오분류되지 않도록 세그먼트 경계를 검사한다', () => {
    expect(resolveFeatureFromPathname('/livechat')).toBe('unknown');
    expect(resolveFeatureFromPathname('/sharepoint')).toBe('unknown');
    expect(resolveFeatureFromPathname('/overviewer')).toBe('unknown');
    expect(resolveFeatureFromPathname('/vote-result')).toBe('unknown');
    expect(resolveFeatureFromPathname('/oauth-callback')).toBe('unknown');
    expect(resolveFeatureFromPathname('/table/customizer/1')).toBe('unknown');
  });

  it('타이머, 투표, 실시간 공유의 5xx는 핵심 흐름 장애로 보고 즉시 대응 대상으로 분류한다', () => {
    expect(resolveApiErrorLevel(500, 'timer')).toBe('fatal');
    expect(resolveApiErrorLevel(500, 'vote')).toBe('fatal');
    expect(resolveApiErrorLevel(500, 'live-share')).toBe('fatal');
    expect(resolveApiErrorLevel(500, 'landing')).toBe('error');
  });

  it('사용자 입력이나 상태 충돌처럼 예상 가능한 에러는 즉시 대응 알림보다 낮은 우선순위로 분류한다', () => {
    expect(resolveApiErrorLevel(400, 'timer')).toBe('warning');
    expect(resolveApiErrorLevel(404, 'vote')).toBe('warning');
    expect(resolveApiErrorLevel(409, 'live-share')).toBe('warning');
    expect(resolveApiErrorLevel(422, 'table-composition')).toBe('warning');
  });

  it('토큰 재발급으로 복구될 수 있는 401은 즉시 대응 알림에서 제외한다', () => {
    const unauthorizedError = new AxiosError(
      'unauthorized',
      undefined,
      undefined,
      undefined,
      {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: null,
      },
    );
    expect(shouldSkipApiError(unauthorizedError)).toBe(true);
  });

  it('사용자 오프라인 상태의 네트워크 에러는 운영자가 바로 대응하기 어려워 수집하지 않는다', () => {
    const offlineError = new AxiosError('Network Error', 'ERR_NETWORK');

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    expect(shouldSkipApiError(offlineError)).toBe(true);
  });

  it('온라인 상태에서 발생한 네트워크 에러는 서버 연결 실패 가능성이 있어 수집한다', () => {
    const onlineNetworkError = new AxiosError('Network Error', 'ERR_NETWORK');

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

    expect(shouldSkipApiError(onlineNetworkError)).toBe(false);
  });

  it('Sentry context에 원본 요청/응답 데이터가 그대로 전송되지 않도록 민감 필드를 마스킹한다', () => {
    expect(
      sanitizeSentryContext({
        email: 'user@example.com',
        inviteCode: 'SECRET',
        page: 1,
        nested: {
          token: 'TOKEN',
          tableId: 12,
        },
      }),
    ).toEqual({
      email: '[Filtered]',
      inviteCode: '[Filtered]',
      page: 1,
      nested: {
        token: '[Filtered]',
        tableId: 12,
      },
    });
  });

  it('Sentry context에 남길 query string에서 OAuth와 인증 관련 값을 마스킹한다', () => {
    expect(
      sanitizeSentrySearch(
        '?code=AUTH_CODE&state=STATE&access_token=TOKEN&page=1',
      ),
    ).toBe(
      '?code=%5BFiltered%5D&state=%5BFiltered%5D&access_token=%5BFiltered%5D&page=1',
    );
  });

  it('알림 제목을 level, error type, feature, status, endpoint 순서로 구성해 대응 판단 흐름을 만든다', () => {
    const error = new AxiosError('Request failed', undefined, {
      method: 'post',
      url: '/api/live/123',
      headers: new AxiosHeaders(),
    });
    const metadata = buildSentryApiErrorMetadata(error, '/ko/live/123');

    const sentryError = createSentryApiError(error, metadata);

    expect(sentryError.name).toBe(
      'error · api-error · live-share · [network-error] POST /api/live/:id',
    );
  });
});
