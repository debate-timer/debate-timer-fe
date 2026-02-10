import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { IoHome } from 'react-icons/io5';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../util/languageRouting';

export default function NotFoundPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;
  const rootPath = buildLangPath('/', lang);

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left />
        <DefaultLayout.Header.Center />
        <DefaultLayout.Header.Right />
      </DefaultLayout.Header>

      <DefaultLayout.ContentContainer>
        <div className="flex w-full flex-col items-start justify-start px-8 py-10">
          <div className="mb-20 flex flex-col font-bold">
            <h1 className="mb-5 text-[120px]">🤔</h1>
            <h1 className="text-4xl md:text-5xl">
              {t('페이지를 찾을 수 없어요...')}
            </h1>
          </div>

          <div className="mb-10 flex flex-col space-y-2">
            <h1 className="text-xl font-bold">{t('요청 URL')}</h1>
            <p className="text-lg">
              {decodeURIComponent(window.location.href)}
            </p>
          </div>

          <div className="mb-20 flex flex-col space-y-2">
            <h1 className="text-xl font-bold">{t('오류 내용')}</h1>
            <p className="whitespace-pre-line text-lg">
              {t(
                '요청하신 페이지를 찾을 수 없어요.\n홈 화면으로 돌아가 처음부터 다시 시도해주세요.',
              )}
            </p>
          </div>

          <button
            className="rounded-full bg-zinc-300 px-8 py-4 hover:bg-zinc-400"
            type="button"
            onClick={() => navigate(rootPath)}
          >
            <div className="flex flex-row items-center justify-center space-x-4">
              <IoHome size={30} />
              <h1 className="mt-0.5 text-2xl font-semibold">
                {t('홈으로 돌아가기')}
              </h1>
            </div>
          </button>
        </div>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
