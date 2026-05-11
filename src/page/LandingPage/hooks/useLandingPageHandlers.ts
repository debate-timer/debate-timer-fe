import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../../../util/accessToken';
import { oAuthLogin } from '../../../util/googleAuth';
import useLogout from '../../../hooks/mutations/useLogout';
import { createTableShareUrlFromTable } from '../../../util/arrayEncoding';
import { SAMPLE_TABLE_DATA } from '../../../constants/sample_table';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../../util/languageRouting';
import useAnalytics from '../../../hooks/useAnalytics';
import { setLoginTrigger } from '../../../util/analytics/loginTrigger';

// 랜딩 페이지의 CTA와 로그인 진입 경로 추적을 한곳에서 관리한다.
const useLandingPageHandlers = () => {
  // 라우팅, 인증, 분석에 필요한 의존성을 준비한다.
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;
  const homePath = buildLangPath('/home', lang);
  const rootPath = buildLangPath('/', lang);
  const { mutate: logoutMutate } = useLogout(() => navigate(homePath));
  const { trackEvent } = useAnalytics();

  // 비회원 체험용 샘플 테이블 공유 링크로 바로 이동한다.
  const handleStartWithoutLogin = useCallback(() => {
    // window.location.href = LANDING_URLS.START_WITHOUT_LOGIN_URL;
    window.location.href = createTableShareUrlFromTable(
      import.meta.env.VITE_SHARE_BASE_URL,
      SAMPLE_TABLE_DATA,
    );
  }, []);
  // 테이블 섹션 CTA에서 로그인 시작 시 login_started 이벤트를 기록한다.
  const handleTableSectionLoginButtonClick = useCallback(() => {
    if (!isLoggedIn()) {
      trackEvent('login_started', {
        trigger_page: homePath,
        trigger_context: 'landing_table_section',
      });
      setLoginTrigger({
        trigger_page: homePath,
        trigger_context: 'landing_table_section',
      });
      oAuthLogin();
    } else {
      navigate(rootPath);
    }
  }, [homePath, navigate, rootPath, trackEvent]);
  // 로그인된 사용자를 메인 화면으로 이동시킨다.
  const handleDashboardButtonClick = useCallback(() => {
    navigate(rootPath);
  }, [navigate, rootPath]);
  // 헤더 로그인 버튼 진입 시 login_started 이벤트를 기록하거나 로그아웃을 수행한다.
  const handleHeaderLoginButtonClick = useCallback(() => {
    if (!isLoggedIn()) {
      trackEvent('login_started', {
        trigger_page: homePath,
        trigger_context: 'landing_header',
      });
      setLoginTrigger({
        trigger_page: homePath,
        trigger_context: 'landing_header',
      });
      oAuthLogin();
    } else {
      logoutMutate();
    }
  }, [homePath, logoutMutate, trackEvent]);

  return {
    handleStartWithoutLogin,
    handleTableSectionLoginButtonClick,
    handleDashboardButtonClick,
    handleHeaderLoginButtonClick,
  };
};

export default useLandingPageHandlers;
