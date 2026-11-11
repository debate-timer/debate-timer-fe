import {
  createTranscriptShareUrl,
  maskTranscriptShareToken,
} from './transcriptShare';

describe('토론 기록 공유 링크', () => {
  it.each([
    [
      'https://debate-timer.com',
      'https://debate-timer.com/transcript/shared/abc',
    ],
    [
      'https://debate-timer.com/',
      'https://debate-timer.com/transcript/shared/abc',
    ],
  ])('%s 주소에 공유 토큰을 붙여 링크를 만든다', (baseUrl, expected) => {
    expect(createTranscriptShareUrl(baseUrl, 'abc')).toBe(expected);
  });

  it('주소가 비어 있으면 현재 사이트 주소를 쓴다', () => {
    expect(createTranscriptShareUrl('', 'abc')).toBe(
      `${window.location.origin}/transcript/shared/abc`,
    );
  });

  it('토큰을 경로에 안전하게 인코딩한다', () => {
    expect(createTranscriptShareUrl('https://a.com', 'a/b c')).toBe(
      'https://a.com/transcript/shared/a%2Fb%20c',
    );
  });

  it.each([
    ['/transcript/shared/abc-123', '/transcript/shared/:shareToken'],
    ['/en/transcript/shared/abc-123', '/en/transcript/shared/:shareToken'],
    [
      'https://a.com/transcript/shared/abc?x=1#y',
      'https://a.com/transcript/shared/:shareToken?x=1#y',
    ],
    ['/api/shared-transcripts/abc-123', '/api/shared-transcripts/:shareToken'],
    ['/api/transcripts/1/share', '/api/transcripts/1/share'],
  ])('%s 에서 공유 토큰을 가린다', (value, expected) => {
    expect(maskTranscriptShareToken(value)).toBe(expected);
  });
});
