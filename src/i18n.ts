import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // 서버에서 번역 파일을 불러오기
  .use(LanguageDetector) // 사용자의 브라우저 언어 감지
  .use(initReactI18next) // i18n 인스턴스를 react-i18next에 전달
  .init({
    supportedLngs: ['ko', 'en'], // 지원할 언어 목록
    fallbackLng: 'ko', // 감지된 언어를 사용할 수 없을 때 사용할 기본 언어

    // 언어를 감지하는 순서와 방법
    detection: {
      order: ['path', 'localStorage', 'navigator'],
      caches: ['localStorage'],
    },

    // 번역 파일을 불러올 위치
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },

    // React와 함께 사용할 때의 옵션
    react: {
      useSuspense: true, // 비동기 번역 파일 로딩을 위해 필요
    },
  });

export default i18n;
