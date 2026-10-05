import { LATEST_PATCH_NOTE } from './patch_note';

describe('LATEST_PATCH_NOTE', () => {
  it('공유 기능 WebP 애니메이션을 한국어·영어 공지 이미지로 사용한다', () => {
    expect(LATEST_PATCH_NOTE.imageKo).toMatch(/0004_share.*\.webp$/);
    expect(LATEST_PATCH_NOTE.imageEn).toBe(LATEST_PATCH_NOTE.imageKo);
  });

  it('이전 공지를 숨긴 사용자에게도 다시 표시되도록 버전을 올린다', () => {
    expect(LATEST_PATCH_NOTE.version).toBe('0004');
  });
});
