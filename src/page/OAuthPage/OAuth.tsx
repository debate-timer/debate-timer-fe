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

export default function OAuth() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasProcessedLogin = useRef(false);
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;

  const { mutate } = usePostUser(() => {
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
