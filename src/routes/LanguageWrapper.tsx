import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import i18n from '../i18n';

const supportedLangs = ['ko', 'en'];

export default function LanguageWrapper() {
  const { lang } = useParams();

  useEffect(() => {
    // URL에 lang 파라미터가 없으면 'ko'를 기본값으로 사용
    const currentLang = lang || 'ko';

    if (supportedLangs.includes(currentLang) && i18n.language !== currentLang) {
      i18n.changeLanguage(currentLang);
    }
  }, [lang]);

  return <Outlet />;
}
