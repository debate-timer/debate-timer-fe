import { useCallback, useEffect } from 'react';
import { getAccessToken } from '../util/accessToken';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../util/languageRouting';

export default function BackActionHandler() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const handleBackAction = useCallback(() => {
    const currentLang = i18n.resolvedLanguage ?? i18n.language;
    const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;
    const rootPath = buildLangPath('/', lang);

    if (getAccessToken() !== null && window.location.pathname === rootPath) {
      // Push the current state again to prevent going back
      navigate(rootPath);
    }
  }, [i18n.language, i18n.resolvedLanguage, navigate]);

  useEffect(() => {
    const onPopState = () => {
      handleBackAction();
    };

    // Listen for the popstate event to handle the back action
    window.addEventListener('popstate', onPopState);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [handleBackAction]);

  return <></>;
}
