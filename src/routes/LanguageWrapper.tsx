import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import i18n from '../i18n';
import usePageTracking from '../hooks/usePageTracking';
import useGlobalSettings from '../hooks/useGlobalSettings';
import {
  buildLangPath,
  getLangFromPath,
  isSupportedLang,
} from '../util/languageRouting';

export default function LanguageWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, status, controller } = useGlobalSettings();
  const linkRef = useRef(
    location.state && 'settingsLinkLanguage' in location.state
      ? location.state.settingsLinkLanguage
      : getLangFromPath(location.pathname),
  );
  usePageTracking();
  useEffect(() => {
    const browser = [...navigator.languages, navigator.language]
      .map((value) => value.toLowerCase().split('-')[0])
      .find(isSupportedLang);
    const selected = controller.getSnapshot().language;
    const lang =
      (controller.hasDirectLanguage() ? selected : null) ??
      linkRef.current ??
      selected ??
      (isSupportedLang(browser) ? browser : 'ko');
    void i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    const path = buildLangPath(location.pathname, lang);
    if (path !== location.pathname) {
      navigate(`${path}${location.search}${location.hash}`, {
        replace: true,
        state: {
          ...location.state,
          settingsLinkLanguage: linkRef.current ?? null,
        },
      });
    }
  }, [
    language,
    status,
    controller,
    location.pathname,
    location.search,
    location.hash,
    location.state,
    navigate,
  ]);
  useEffect(() => {
    void controller.flush();
  }, [controller, location.key]);
  return <Outlet />;
}
