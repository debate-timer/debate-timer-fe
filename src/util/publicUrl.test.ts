import { buildPublicUrl } from './publicUrl';

afterEach(() => vi.unstubAllEnvs());

describe('공개 공유 URL', () => {
  it('미리보기 경로를 라이브·투표 링크에 보존한다', () => {
    vi.stubEnv('VITE_BASE_PATH', '/pr-569');
    vi.stubEnv('VITE_SHARE_BASE_URL', 'https://preview.example/');
    expect(buildPublicUrl('/live/12')).toBe(
      'https://preview.example/pr-569/live/12',
    );
    expect(buildPublicUrl('/vote/7')).toBe(
      'https://preview.example/pr-569/vote/7',
    );
  });
  it('호스트 미설정은 현재 origin을 사용한다', () => {
    vi.stubEnv('VITE_BASE_PATH', '/');
    vi.stubEnv('VITE_SHARE_BASE_URL', '');
    expect(buildPublicUrl('/vote/7')).toBe(`${window.location.origin}/vote/7`);
  });
});
