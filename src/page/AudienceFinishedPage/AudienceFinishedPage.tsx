import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import CheckBox from '../../components/icons/CheckBox';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../util/languageRouting';

// 라이브 공유 토론이 끝난 뒤 청중에게 보여주는 종료 안내 페이지다.
export default function AudienceFinishedPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;

  const handleClosePage = () => {
    // 일단 페이지 닫기
    window.close();

    // 페이지를 못 닫을 경우 현재 언어의 홈으로
    setTimeout(() => {
      navigate(buildLangPath('/home', lang), { replace: true });
    }, 100);
  };

  return (
    <DefaultLayout>
      <DefaultLayout.ContentContainer noPadding>
        <div className="flex w-full flex-1 items-center justify-center bg-white px-6 py-10">
          <div className="flex w-full max-w-md flex-col items-center gap-4 text-center md:gap-6">
            {/* 체크 아이콘 배지 */}
            <CheckBox
              className="bg-brand text-white"
              checked={true}
              size={'clamp(3rem, 8vw, 5rem)'}
            />

            {/* 종료 안내 문구 */}
            <h1 className="break-keep text-2xl font-bold text-gray-800 md:text-3xl xl:text-5xl">
              {t('토론이 종료되었습니다.')}
            </h1>
            <p className="break-keep text-base text-gray-500 md:text-lg xl:text-xl">
              {t('참여해 주셔서 감사합니다.')}
            </p>

            <button
              type="button"
              className="mt-4 w-full rounded-lg bg-gray-800 px-6 py-3 text-lg font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 md:w-auto"
              onClick={handleClosePage}
            >
              {t('페이지 닫기')}
            </button>
          </div>
        </div>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
