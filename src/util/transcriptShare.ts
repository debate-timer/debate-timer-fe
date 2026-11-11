// 공유받은 토론 기록을 보는 화면의 경로
export const TRANSCRIPT_SHARE_PATH = '/transcript/shared';

/**
 * 토론 기록 공유 토큰으로 로그인 없이 볼 수 있는 공유 링크를 만든다.
 * 공유 주소가 비어 있으면 현재 사이트 주소를 쓴다.
 */
export function createTranscriptShareUrl(
  baseUrl: string | undefined,
  shareToken: string,
): string {
  const origin =
    baseUrl && baseUrl.trim() !== ''
      ? baseUrl.replace(/\/+$/, '')
      : window.location.origin;
  return `${origin}${TRANSCRIPT_SHARE_PATH}/${encodeURIComponent(shareToken)}`;
}

// 공유 화면 경로와 공유 조회 API 경로의 토큰 구간
const SHARE_TOKEN_SEGMENT_PATTERN =
  /(\/(?:transcript\/shared|shared-transcripts)\/)[^/?#]+/g;

/**
 * 경로·URL에서 공유 토큰을 가린다.
 * 토큰이 있으면 누구나 기록을 볼 수 있으므로 분석·오류 수집으로 보내기 전에 사용한다.
 */
export function maskTranscriptShareToken(value: string): string {
  return value.replace(SHARE_TOKEN_SEGMENT_PATTERN, '$1:shareToken');
}
