import { Navigate } from 'react-router-dom';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingIndicator from '../components/LoadingIndicator/LoadingIndicator';
import useFeatureFlag from '../hooks/useFeatureFlag';
import { FeatureFlag } from '../types/featureFlag';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../util/languageRouting';

interface FeatureFlagRouteProps extends PropsWithChildren {
  flag: FeatureFlag;
}

// 피쳐 플래그가 없는 회원이 주소로 직접 들어오면 대시보드로 보낸다.
export default function FeatureFlagRoute(props: FeatureFlagRouteProps) {
  const { flag, children } = props;
  const { i18n } = useTranslation();
  const { isEnabled, isLoading } = useFeatureFlag(flag);

  if (isLoading) {
    return <LoadingIndicator />;
  }
  if (!isEnabled) {
    const currentLang = i18n.resolvedLanguage ?? i18n.language;
    const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;
    return <Navigate to={buildLangPath('/', lang)} replace />;
  }

  return children;
}
