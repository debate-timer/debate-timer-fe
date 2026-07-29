import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import {
  buildLangPath,
  DEFAULT_LANG,
  getLangFromPath,
  isSupportedLang,
} from '../util/languageRouting';
import { isGuestFlow } from '../util/sessionStorage';
import { isMaintenanceModeEnabled } from '../util/maintenanceMode';
import {
  isMaintenanceAccessAllowed,
  MaintenanceAccess,
} from './maintenanceAccess';

interface MaintenanceRouteProps extends PropsWithChildren {
  access: MaintenanceAccess;
}

export default function MaintenanceRoute({
  access,
  children,
}: MaintenanceRouteProps) {
  const location = useLocation();
  const params = useParams();
  const { i18n } = useTranslation();

  if (!isMaintenanceModeEnabled()) return children;

  const isAllowed = isMaintenanceAccessAllowed({
    access,
    hasGuestSession: isGuestFlow(),
    params,
    search: location.search,
  });

  if (isAllowed) return children;

  const pathLang = getLangFromPath(location.pathname);
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang =
    pathLang ?? (isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG);

  return <Navigate to={buildLangPath('/home', lang)} replace />;
}
