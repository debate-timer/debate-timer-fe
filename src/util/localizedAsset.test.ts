import { resolveLocalizedAsset } from './localizedAsset';

describe('언어별 에셋 선택', () => {
  it('현재 언어의 에셋이 있으면 그 에셋을 반환한다', () => {
    expect(resolveLocalizedAsset({ ko: 'ko.webp', en: 'en.webp' }, 'en')).toBe(
      'en.webp',
    );
  });

  it.each([
    ['현재 언어의 에셋이 없으면', { ko: 'ko.webp' }, 'en'],
    ['지원하지 않는 언어이면', { ko: 'ko.webp', en: 'en.webp' }, 'ja'],
    ['언어 값이 없으면', { ko: 'ko.webp', en: 'en.webp' }, undefined],
  ])('%s 기본 언어 에셋을 반환한다', (_, assets, lang) => {
    expect(resolveLocalizedAsset(assets, lang)).toBe('ko.webp');
  });

  it('기본 언어 에셋도 없으면 null을 반환한다', () => {
    expect(resolveLocalizedAsset({}, 'ko')).toBeNull();
    expect(resolveLocalizedAsset({ en: 'en.webp' }, 'ko')).toBeNull();
  });
});
