import {
  DEFAULT_LANG,
  isSupportedLang,
  SupportedLang,
} from './languageRouting';

export type LocalizedAsset = Partial<Record<SupportedLang, string>>;

/**
 * 현재 언어에 맞는 에셋 경로를 고름.
 * 해당 언어의 에셋이 없거나 지원하지 않는 언어이면 기본 언어 에셋을 사용하고,
 * 기본 언어 에셋도 없으면 `null`을 반환함.
 */
export function resolveLocalizedAsset(
  assets: LocalizedAsset,
  lang: string | undefined,
): string | null {
  if (isSupportedLang(lang) && assets[lang]) {
    return assets[lang];
  }
  return assets[DEFAULT_LANG] ?? null;
}
