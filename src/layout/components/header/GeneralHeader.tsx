import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HeaderFrame from './HeaderFrame';
import BrandLink from './BrandLink';
import { buildLangPath, isSupportedLang } from '../../../util/languageRouting';

interface GeneralHeaderProps {
  isMember: boolean;
  canViewRecords: boolean;
  onRequireLogin: (path: string) => void;
  actions?: ReactNode;
  onIntroduction?: () => void;
  inquiries?: readonly { label: string; url: string }[];
}

const LAYOUT_CLASS =
  'mx-auto grid w-full max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] md:flex md:flex-wrap items-center justify-between gap-x-3 gap-y-3 md:gap-x-6';
const NAV_CLASS =
  'order-3 col-span-2 flex w-full flex-wrap items-center gap-x-5 gap-y-2 text-ui-label md:order-none md:w-auto';
const LINK_CLASS =
  'rounded-md py-1 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2';
const INQUIRY_CLASS =
  'absolute left-0 z-40 mt-2 w-64 space-y-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg';

/** 일반 화면의 탐색과 받은 계정 조작을 배치하며 통신·로그인을 시작하지 않음. */
export default function GeneralHeader(props: GeneralHeaderProps) {
  const {
    isMember,
    canViewRecords,
    onRequireLogin,
    actions,
    onIntroduction,
    inquiries = [],
  } = props;
  const { t, i18n } = useTranslation();
  const lang = isSupportedLang(i18n.language) ? i18n.language : 'ko';
  const navigation = [
    { path: '/', label: '서비스 소개', requiresAuth: false },
    { path: '/dashboard', label: '대시보드', requiresAuth: true },
    ...(!isMember || canViewRecords
      ? [{ path: '/records', label: '토론 기록', requiresAuth: true }]
      : []),
    { path: '/templates', label: '템플릿', requiresAuth: false },
  ];
  return (
    <HeaderFrame>
      <div className={LAYOUT_CLASS}>
        <BrandLink onNavigate={onIntroduction} />
        <nav aria-label={t('주요 탐색')} className={NAV_CLASS}>
          {navigation.map((item) => {
            const destination = buildLangPath(item.path, lang);
            return (
              <Link
                className={LINK_CLASS}
                key={item.path}
                to={destination}
                onClick={(event) => {
                  if (item.path === '/') {
                    onIntroduction?.();
                  }
                  if (item.requiresAuth && !isMember) {
                    event.preventDefault();
                    onRequireLogin(destination);
                  }
                }}
              >
                {t(item.label)}
              </Link>
            );
          })}
          {inquiries.length > 0 && (
            <details
              className="relative"
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  event.stopPropagation();
                  event.currentTarget.open = false;
                  event.currentTarget.querySelector('summary')?.focus();
                }
              }}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  event.currentTarget.open = false;
                }
              }}
            >
              <summary className="cursor-pointer rounded-md py-1">
                {t('문의')}
              </summary>
              <div className={INQUIRY_CLASS}>
                {inquiries.map((item) => (
                  <a
                    key={item.label}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block underline"
                  >
                    {t(item.label)}
                  </a>
                ))}
              </div>
            </details>
          )}
        </nav>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {actions}
        </div>
      </div>
    </HeaderFrame>
  );
}
