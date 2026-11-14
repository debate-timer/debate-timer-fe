import useAnalytics from './useAnalytics';
import { setLoginTrigger } from '../util/analytics/loginTrigger';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LoginReturn,
  saveLoginReturn,
  validateLoginReturn,
} from '../util/loginReturn';
import { buildLangPath, isSupportedLang } from '../util/languageRouting';
import { isGuestFlow } from '../util/sessionStorage';
import { oAuthLogin } from '../util/googleAuth';

/** 로그인 확인과 목적지 보존을 조립함. 참여 입력 등 임의 화면 상태는 저장하지 않음. */
export default function useLoginPrompt() {
  const location = useLocation();
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();
  const { i18n } = useTranslation();
  const lang = isSupportedLang(i18n.language) ? i18n.language : 'ko';
  const [destination, setDestination] = useState<LoginReturn | null>(null);
  const [keepGuestTable, setKeepGuestTable] = useState(true);
  const [hasError, setHasError] = useState(false);
  let hasGuestTable = false;
  try {
    hasGuestTable = isGuestFlow();
  } catch {
    // 저장소 차단 시 게스트 데이터 유지 선택을 제공하지 않음.
  }
  useEffect(() => {
    const request = validateLoginReturn(location.state?.loginRequest);
    if (request) {
      setDestination(request);
      const state = { ...location.state };
      delete state.loginRequest;
      navigate(`${location.pathname}${location.search}${location.hash}`, {
        replace: true,
        state,
      });
    }
  }, [location, navigate]);
  const requestLogin = useCallback(
    (path = buildLangPath('/dashboard', lang)) => {
      const request = validateLoginReturn({
        path,
        termination: location.state?.audienceTermination,
      });
      setKeepGuestTable(true);
      setHasError(false);
      setDestination(request);
    },
    [lang, location.state],
  );
  const cancel = useCallback(() => setDestination(null), []);
  const start = () => {
    if (!destination) {
      return;
    }
    saveLoginReturn(destination);
    if (buildLangPath(location.pathname, 'ko') === '/') {
      const trigger = {
        trigger_page: location.pathname,
        trigger_context: 'landing_header' as const,
      };
      trackEvent('login_started', trigger);
      try {
        setLoginTrigger(trigger);
      } catch {
        /* 분석 문맥 저장 실패가 로그인을 차단하지 않음. */
      }
    }
    try {
      sessionStorage.setItem(
        'keepGuestTable',
        String(hasGuestTable && keepGuestTable),
      );
    } catch {
      // 저장소를 사용할 수 없어도 로그인을 진행함.
    }
    try {
      oAuthLogin();
    } catch {
      setHasError(true);
    }
  };
  return {
    isOpen: destination !== null,
    requestLogin,
    cancel,
    start,
    hasGuestTable,
    keepGuestTable,
    setKeepGuestTable,
    hasError,
  };
}
