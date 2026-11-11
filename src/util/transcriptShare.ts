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
