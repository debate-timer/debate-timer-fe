import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator';
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
import { consumeLoginReturn } from '../../util/loginReturn';

// Google 인가 코드는 한 번만 쓸 수 있어, 보낸 코드를 기록해 재진입 시 다시 보내지 않음
const USED_OAUTH_CODE_KEY = 'oauthUsedCode';

function readSessionValue(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

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
    const destination = consumeLoginReturn();
    let hasGuestTable = false;
    try {
      hasGuestTable = isGuestFlow();
    } catch {
      /* 저장소 차단 시 기본 목적지를 사용함. */
    }
    const path = hasGuestTable
      ? buildLangPath('/share', lang)
      : (destination?.path ?? buildLangPath('/dashboard', lang));
    navigate(path, {
      replace: true,
      state:
        !hasGuestTable && destination?.termination
          ? { audienceTermination: destination.termination }
          : undefined,
    });
  };
  const goToHome = () => {
    consumeLoginReturn();
    navigate(buildLangPath('/', lang), { replace: true });
  };

  // 로그인 완료 시 login_completed 이벤트를 기록하고 게스트 플로우 여부에 따라 이동한다.
  const { mutate } = usePostUser((data) => {
    let trigger: ReturnType<typeof consumeLoginTrigger> = null;
    try {
      trigger = consumeLoginTrigger();
    } catch {
      /* 분석 문맥 부재가 로그인을 차단하지 않음. */
    }
    trackEvent('login_completed', {
      trigger_page: trigger?.trigger_page ?? 'unknown',
      trigger_context: trigger?.trigger_context ?? 'unknown',
      member_id: data.id,
    });

    try {
      if (readSessionValue('keepGuestTable') === 'false') {
        deleteSessionCustomizeTableData();
      }
      sessionStorage.removeItem('keepGuestTable');
    } catch {
      /* 사용할 수 없는 게스트 저장소는 복귀 목적지에서 제외함. */
    }

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
      if (readSessionValue(USED_OAUTH_CODE_KEY) === code) {
        goToHome();
        return;
      }

      try {
        sessionStorage.setItem(USED_OAUTH_CODE_KEY, code);
      } catch {
        /* 현재 마운트의 ref로 중복 실행을 막음. */
      }
      mutate(code);
    };

    loginOAuth();

    return () => {
      hasProcessedLogin.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DefaultLayout>
      <DefaultLayout.ContentContainer>
        <LoadingIndicator />
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
