import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../../../util/accessToken';
import { oAuthLogin } from '../../../util/googleAuth';
import useLogout from '../../../hooks/mutations/useLogout';
import { createTableShareUrl } from '../../../util/arrayEncoding';
import { SAMPLE_TABLE_DATA } from '../../../constants/sample_table';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../../util/languageRouting';

const useLandingPageHandlers = () => {
  // Prepare dependencies
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;
  const homePath = buildLangPath('/home', lang);
  const rootPath = buildLangPath('/', lang);
  const { mutate: logoutMutate } = useLogout(() => navigate(homePath));

  // Declare functions that represent business logics
  const handleStartWithoutLogin = useCallback(() => {
    // window.location.href = LANDING_URLS.START_WITHOUT_LOGIN_URL;
    window.location.href = createTableShareUrl(
      import.meta.env.VITE_SHARE_BASE_URL,
      SAMPLE_TABLE_DATA,
    );
  }, []);
  const handleTableSectionLoginButtonClick = useCallback(() => {
    if (!isLoggedIn()) {
      oAuthLogin();
    } else {
      navigate(rootPath);
    }
  }, [navigate, rootPath]);
  const handleDashboardButtonClick = useCallback(() => {
    navigate(rootPath);
  }, [navigate, rootPath]);
  const handleHeaderLoginButtonClick = useCallback(() => {
    if (!isLoggedIn()) {
      oAuthLogin();
    } else {
      logoutMutate();
    }
  }, [logoutMutate]);

  return {
    handleStartWithoutLogin,
    handleTableSectionLoginButtonClick,
    handleDashboardButtonClick,
    handleHeaderLoginButtonClick,
  };
};

export default useLandingPageHandlers;
