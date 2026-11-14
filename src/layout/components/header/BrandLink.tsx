import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { buildLangPath, isSupportedLang } from '../../../util/languageRouting';

const LINK_CLASS =
  'flex min-w-0 items-center gap-2 rounded-lg text-ui-label focus-visible:outline-2 focus-visible:outline-offset-2';

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
      <span>Debate Timer</span>
    </Link>
  );
}
