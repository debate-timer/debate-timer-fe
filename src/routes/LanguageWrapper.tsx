import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import i18n from '../i18n';
import {
  DEFAULT_LANG,
  buildLangPath,
  getSelectedLangFromRoute,
  isSupportedLang,
  stripDefaultLangFromPath,
} from '../util/languageRouting';

export default function LanguageWrapper() {
  const { lang } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const selectedLang = getSelectedLangFromRoute(lang, location.pathname);
    const currentLang = i18n.resolvedLanguage ?? i18n.language;

    if (lang === DEFAULT_LANG) {
      const nextPath = stripDefaultLangFromPath(location.pathname);
      navigate(nextPath || '/', { replace: true });
      return;
    }

    if (!lang && isSupportedLang(currentLang) && currentLang !== DEFAULT_LANG) {
      const nextPath = buildLangPath(location.pathname, currentLang);
      if (nextPath !== location.pathname) {
        navigate(nextPath, { replace: true });
        return;
      }
    }

    if (isSupportedLang(selectedLang) && i18n.language !== selectedLang) {
      i18n.changeLanguage(selectedLang);
    }
  }, [lang, location.pathname, navigate]);

  return <Outlet />;
}
