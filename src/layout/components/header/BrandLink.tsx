import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { buildLangPath, isSupportedLang } from '../../../util/languageRouting';

interface BrandLinkProps {
  onNavigate?: () => void;
  hideTitleOnMobile?: boolean;
}

const LINK_CLASS =
  'flex min-h-11 min-w-0 shrink-0 items-center gap-2 rounded-lg text-xl leading-6 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2';

/** 헤더 브랜드명을 20px·행간 24px·굵기 600·자간 -0.05em으로 표시하며, 옵션에 따라 모바일에서 아이콘만 노출함. */
export default function BrandLink(props: BrandLinkProps) {
  const { onNavigate, hideTitleOnMobile = false } = props;
  const { t, i18n } = useTranslation();
  const lang = isSupportedLang(i18n.language) ? i18n.language : 'ko';
  return (
    <Link
      className={clsx(
        LINK_CLASS,
        hideTitleOnMobile &&
          'min-w-11 justify-center md:min-w-0 md:justify-start',
      )}
      to={buildLangPath('/', lang)}
      aria-label={t('서비스 소개')}
      onClick={onNavigate}
    >
      <img
        src={`${import.meta.env.BASE_URL}favicons/favicon.svg`}
        alt=""
        className="size-8 shrink-0"
      />
      <span
        className={clsx(
          'tracking-tighter',
          hideTitleOnMobile && 'hidden md:inline',
        )}
      >
        Debate Timer
      </span>
    </Link>
  );
}
