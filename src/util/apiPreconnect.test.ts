import { buildApiPreconnectTags, resolveApiOrigin } from './apiPreconnect';

describe('API preconnect 태그 생성', () => {
  it('유효한 http/https API 주소에서 origin만 추출한다', () => {
    expect(resolveApiOrigin('https://api.prod.debate-timer.com')).toBe(
      'https://api.prod.debate-timer.com',
    );
    expect(resolveApiOrigin('https://api.dev.debate-timer.com/v1/')).toBe(
      'https://api.dev.debate-timer.com',
    );
    expect(resolveApiOrigin('http://localhost:8080/api')).toBe(
      'http://localhost:8080',
    );
  });

  it.each([undefined, '', '   ', '/api', 'ftp://api.example.com', 'not-a-url'])(
    '유효하지 않거나 상대 경로인 주소(%s)에서는 origin을 반환하지 않는다',
    (apiBaseUrl) => {
      expect(resolveApiOrigin(apiBaseUrl)).toBeNull();
      expect(buildApiPreconnectTags(apiBaseUrl)).toEqual([]);
    },
  );

  it('withCredentials 요청과 커넥션 풀을 맞추도록 use-credentials preconnect와 dns-prefetch 태그를 생성한다', () => {
    expect(
      buildApiPreconnectTags('https://api.prod.debate-timer.com/api'),
    ).toEqual([
      {
        tag: 'link',
        attrs: {
          rel: 'preconnect',
          href: 'https://api.prod.debate-timer.com',
          crossorigin: 'use-credentials',
        },
        injectTo: 'head-prepend',
      },
      {
        tag: 'link',
        attrs: {
          rel: 'dns-prefetch',
          href: 'https://api.prod.debate-timer.com',
        },
        injectTo: 'head-prepend',
      },
    ]);
  });
});
