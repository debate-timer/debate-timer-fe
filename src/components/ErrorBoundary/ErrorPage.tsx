import { useTranslation } from 'react-i18next';
import { IoHome } from 'react-icons/io5';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { useNavigate } from 'react-router-dom';
import { APIError } from '../../apis/primitives';
import { ERROR_STATUS_TABLE } from '../../constants/errors';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../util/languageRouting';

interface ErrorPageProps {
  error: Error;
  stack: string;
  onReset: () => void;
}

export default function ErrorPage({ error, stack, onReset }: ErrorPageProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;
  const homePath = buildLangPath('/', lang);
  const goToHome = () => {
    onReset();
    navigate(homePath, { replace: true });
  };

  // If error is from API request, print status code
  // to let user know exact reason of error.
  const title = (() => {
    if (!(error instanceof APIError)) {
      return t('오류가 발생했어요...');
    }

    const statusKey = ERROR_STATUS_TABLE[error.status];
    return statusKey
      ? t(statusKey)
      : t('{{status}} 오류', { status: error.status });
  })();

  return (
    <DefaultLayout>
      <DefaultLayout.ContentContainer>
        <div className="flex w-full flex-col items-start justify-start px-8 py-10">
          <div className="mb-20 flex flex-col font-bold">
            <h1 className="mb-5 text-[120px]">😭</h1>
            <h1 className="text-4xl md:text-5xl">{title}</h1>
          </div>

          <div className="mb-10 flex flex-col space-y-2">
            <h1 className="text-xl font-bold">{t('오류 내용')}</h1>
            <p className="text-lg">{error.message}</p>
          </div>

          <div className="mb-20 flex flex-col space-y-2">
            <h1 className="text-xl font-bold">{t('스택')}</h1>
            <p className="text-lg">{stack}</p>
          </div>

          <button
            className="rounded-full bg-zinc-300 px-8 py-4 hover:bg-zinc-400"
            type="button"
            onClick={goToHome}
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
