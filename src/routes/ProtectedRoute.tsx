import { Navigate, useLocation, useParams } from 'react-router-dom';
import { PropsWithChildren, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { GUEST_TABLE_ID } from '../hooks/useEnsureGuestTable';
import { getAccessToken } from '../util/accessToken';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../util/languageRouting';
import { setLoginTrigger } from '../util/analytics/loginTrigger';

interface ProtectedRouteProps extends PropsWithChildren {
  allowGuestId?: boolean;
}

function subscribeAuthChange(listener: () => void) {
  window.addEventListener('auth-changed', listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener('auth-changed', listener);
    window.removeEventListener('storage', listener);
  };
}

function getAccessTokenSnapshot(): boolean {
  return Boolean(getAccessToken());
}

export default function ProtectedRoute(props: ProtectedRouteProps) {
  const { allowGuestId = false, children } = props;
  const { i18n } = useTranslation();
  const { id } = useParams();

  const isAuthenticated = useSyncExternalStore(
    subscribeAuthChange,
    getAccessTokenSnapshot,
  );
  const location = useLocation();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;
  const homePath = buildLangPath('/', lang);

  if (allowGuestId && id === GUEST_TABLE_ID) {
    return children;
  }

  if (!isAuthenticated) {
    setLoginTrigger({
      trigger_page: location.pathname,
      trigger_context: 'protected_route',
    });
    return (
      <Navigate
        to={homePath}
        state={{
          loginRequest: {
            path: `${location.pathname}${location.search}${location.hash}`,
          },
        }}
        replace
      />
    );
  }

  return children;
}
