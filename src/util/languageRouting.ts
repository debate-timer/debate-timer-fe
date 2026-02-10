const SUPPORTED_LANGS = ['ko', 'en'] as const;
const DEFAULT_LANG = 'ko';

type SupportedLang = (typeof SUPPORTED_LANGS)[number];

const isSupportedLang = (value?: string): value is SupportedLang =>
  !!value && SUPPORTED_LANGS.includes(value as SupportedLang);

const getLangFromPath = (pathname: string): SupportedLang | undefined => {
  const pathSegments = pathname.split('/');
  return isSupportedLang(pathSegments[1]) ? pathSegments[1] : undefined;
};

const getSelectedLang = (langParam?: string): SupportedLang =>
  isSupportedLang(langParam) ? langParam : DEFAULT_LANG;

const getSelectedLangFromRoute = (
  langParam: string | undefined,
  pathname: string,
): SupportedLang => getSelectedLang(langParam ?? getLangFromPath(pathname));

const stripDefaultLangFromPath = (pathname: string): string => {
  const updated = pathname.replace(new RegExp(`^/${DEFAULT_LANG}(?=/|$)`), '/');
  return updated === '/' ? updated : updated.replace(/\/+$/, '');
};

const buildLangPath = (pathname: string, lang: SupportedLang): string => {
  const pathSegments = pathname.split('/');
  const hasLangSegment =
    pathSegments.length > 1 && isSupportedLang(pathSegments[1]);

  if (lang === DEFAULT_LANG) {
    if (hasLangSegment) {
      pathSegments.splice(1, 1);
      return pathSegments.join('/') || '/';
    }
    return pathname;
  }

  if (hasLangSegment) {
    pathSegments[1] = lang;
    return pathSegments.join('/');
  }

  return `/${lang}${pathname === '/' ? '' : pathname}`;
};

export {
  SUPPORTED_LANGS,
  DEFAULT_LANG,
  isSupportedLang,
  getLangFromPath,
  getSelectedLang,
  getSelectedLangFromRoute,
  stripDefaultLangFromPath,
  buildLangPath,
};
