import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { buildLangPath, isSupportedLang } from '../../../util/languageRouting';

const LINK_CLASS =
  'flex min-w-0 items-center gap-2 rounded-lg text-xl leading-6 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2';

/** 헤더 브랜드명을 20px·행간 24px·굵기 600·자간 -0.05em으로 표시함. */
export default function BrandLink(props: { onNavigate?: () => void }) {
  const { t, i18n } = useTranslation();
  const lang = isSupportedLang(i18n.language) ? i18n.language : 'ko';
  return (
    <Link
      className={LINK_CLASS}
      to={buildLangPath('/', lang)}
      aria-label={t('서비스 소개')}
      onClick={props.onNavigate}
    >
      <img
        src={`${import.meta.env.BASE_URL}favicons/favicon.svg`}
        alt=""
        className="size-8 shrink-0"
      />
      <span className="tracking-tighter">Debate Timer</span>
    </Link>
  );
}
