import { Navigate, useLocation } from 'react-router-dom';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { getAccessToken } from '../util/accessToken';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../util/languageRouting';
import { setLoginTrigger } from '../util/analytics/loginTrigger';

export default function ProtectedRoute(props: PropsWithChildren) {
  const { children } = props;
  const { i18n } = useTranslation();

  const isAuthenticated = getAccessToken() || false;
  const location = useLocation();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;
  const homePath = buildLangPath('/home', lang);

  if (!isAuthenticated) {
    setLoginTrigger({
      trigger_page: location.pathname,
      trigger_context: 'protected_route',
    });
    return <Navigate to={homePath} state={{ from: location }} replace />;
  }

  return children;
}
