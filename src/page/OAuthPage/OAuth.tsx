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

// OAuth 콜백을 처리하고 로그인 완료 후 적절한 화면으로 이동시킨다.
export default function OAuth() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasProcessedLogin = useRef(false);
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;

  const { trackEvent } = useAnalytics();

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

    if (isGuestFlow()) {
      navigate(buildLangPath('/share', lang));
    } else {
      navigate(buildLangPath('/', lang));
    }
  });

  // OAuth 인가 코드를 한 번만 소비해 로그인 요청을 보낸다.
  useEffect(() => {
    if (hasProcessedLogin.current === true) {
      return;
    }

    const loginOAuth = async () => {
      const code = searchParams.get('code');
      if (code === null) {
        return;
      }
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
