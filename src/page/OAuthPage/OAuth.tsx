import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePostUser } from '../../hooks/mutations/usePostUser';
import {
  deleteSessionCustomizeTableData,
  isGuestFlow,
} from '../../util/sessionStorage';
import { useTranslation } from 'react-i18next';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../util/languageRouting';
import useAnalytics from '../../hooks/useAnalytics';
import { consumeLoginTrigger } from '../../util/analytics/loginTrigger';
import { isLoggedIn } from '../../util/accessToken';

// Google 인가 코드는 한 번만 쓸 수 있어, 보낸 코드를 기록해 재진입 시 다시 보내지 않음
const USED_OAUTH_CODE_KEY = 'oauthUsedCode';

// OAuth 콜백을 처리하고 로그인 완료 후 적절한 화면으로 이동시킨다.
export default function OAuth() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasProcessedLogin = useRef(false);
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;

  const { trackEvent } = useAnalytics();

  // 콜백 주소가 기록에 남으면 뒤로가기로 돌아와 같은 코드를 다시 보내므로 replace로 이동함
  const goToLoggedInPage = () => {
    const path = isGuestFlow() ? '/share' : '/';
    navigate(buildLangPath(path, lang), { replace: true });
  };
  const goToHome = () => {
    navigate(buildLangPath('/home', lang), { replace: true });
  };

  // 로그인 완료 시 login_completed 이벤트를 기록하고 게스트 플로우 여부에 따라 이동한다.
  const { mutate } = usePostUser((data) => {
    const trigger = consumeLoginTrigger();
    trackEvent('login_completed', {
      trigger_page: trigger?.trigger_page ?? 'unknown',
      trigger_context: trigger?.trigger_context ?? 'unknown',
      member_id: data.id,
    });

    const keepGuestTable = sessionStorage.getItem('keepGuestTable');

    if (keepGuestTable === 'false') {
      deleteSessionCustomizeTableData();
    }

    sessionStorage.removeItem('keepGuestTable');

    goToLoggedInPage();
  }, goToHome);

  // OAuth 인가 코드를 한 번만 소비해 로그인 요청을 보낸다.
  useEffect(() => {
    if (hasProcessedLogin.current === true) {
      return;
    }

    const loginOAuth = async () => {
      if (isLoggedIn()) {
        goToLoggedInPage();
        return;
      }

      const code = searchParams.get('code');
      if (code === null) {
        return;
      }
      if (sessionStorage.getItem(USED_OAUTH_CODE_KEY) === code) {
        goToHome();
        return;
      }

      sessionStorage.setItem(USED_OAUTH_CODE_KEY, code);
      mutate(code);
    };

    loginOAuth();

    return () => {
      hasProcessedLogin.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
