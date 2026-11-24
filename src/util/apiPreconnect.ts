import type { HtmlTagDescriptor } from 'vite';

/**
 * 유효한 http/https API 기본 주소에서 origin만 추출함.
 * 미설정·상대 경로·비정상 주소는 preconnect 대상에서 제외함.
 */
export function resolveApiOrigin(apiBaseUrl?: string): string | null {
  const trimmedUrl = apiBaseUrl?.trim();

  if (!trimmedUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(trimmedUrl);

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return null;
    }

    return parsedUrl.origin;
  } catch {
    return null;
  }
}

/**
 * credentialed CORS API 요청(withCredentials: true)과 커넥션 풀을 맞추는
 * preconnect 및 dns-prefetch HTML 태그 목록을 생성함.
 */
export function buildApiPreconnectTags(
  apiBaseUrl?: string,
): HtmlTagDescriptor[] {
  const origin = resolveApiOrigin(apiBaseUrl);

  if (!origin) {
    return [];
  }

  return [
    {
      tag: 'link',
      attrs: {
        rel: 'preconnect',
        href: origin,
        crossorigin: 'use-credentials',
      },
      injectTo: 'head-prepend',
    },
    {
      tag: 'link',
      attrs: {
        rel: 'dns-prefetch',
        href: origin,
      },
      injectTo: 'head-prepend',
    },
  ];
}
