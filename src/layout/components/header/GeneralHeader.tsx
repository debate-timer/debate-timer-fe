import { ReactNode, useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { IoChevronDown, IoOpenOutline } from 'react-icons/io5';
import HeaderFrame from './HeaderFrame';
import BrandLink from './BrandLink';
import Button from '../../../components/Button/Button';
import Overlay from '../../../components/Overlay/Overlay';
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
  'order-3 col-span-2 flex w-full flex-wrap items-center gap-x-2 gap-y-2 text-ui-label md:order-none md:w-auto';
const LINK_CLASS =
  'inline-flex min-h-11 items-center rounded-xl px-3.5 py-2 text-neutral-700 no-underline transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 aria-[current=page]:bg-brand aria-[current=page]:text-neutral-900 aria-[current=page]:hover:bg-brand motion-reduce:transition-none';
const INQUIRY_BUTTON_CLASS =
  'inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3.5 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 motion-reduce:transition-none';
const INQUIRY_CLASS = 'absolute left-0 z-40 mt-2 w-[320px] space-y-2';

/**
 * 일반 화면의 탐색과 받은 계정 조작을 배치하며 통신·로그인을 시작하지 않음.
 * 언어 접두어를 제외한 루트·템플릿·기록 경로만 각각 선택하고 나머지는 대시보드를 강조함.
 */
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
  const { pathname } = useLocation();
  const [isInquiriesOpen, setIsInquiriesOpen] = useState(false);
  const inquiryContainerRef = useRef<HTMLDivElement>(null);
  const inquiryButtonRef = useRef<HTMLButtonElement>(null);
  const inquiryMenuId = useId();
  useEffect(() => {
    if (!isInquiriesOpen) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !inquiryContainerRef.current?.contains(event.target)
      ) {
        setIsInquiriesOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isInquiriesOpen]);
  const path = buildLangPath(pathname, 'ko');
  const selectedPath =
    path === '/' || path === '/templates' || path === '/records'
      ? path
      : '/dashboard';
  const lang = isSupportedLang(i18n.language) ? i18n.language : 'ko';
  const navigation = [
    { path: '/', label: '서비스 소개', requiresAuth: false },
    { path: '/dashboard', label: '대시보드', requiresAuth: true },
    ...(isMember && canViewRecords
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
                aria-current={item.path === selectedPath ? 'page' : undefined}
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
            <div
              ref={inquiryContainerRef}
              className="relative"
              onKeyDown={(event) => {
                if (event.key === 'Escape' && isInquiriesOpen) {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsInquiriesOpen(false);
                  inquiryButtonRef.current?.focus();
                }
              }}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setIsInquiriesOpen(false);
                }
              }}
            >
              <button
                ref={inquiryButtonRef}
                type="button"
                aria-label={t('문의')}
                aria-expanded={isInquiriesOpen}
                aria-controls={isInquiriesOpen ? inquiryMenuId : undefined}
                className={clsx(
                  INQUIRY_BUTTON_CLASS,
                  isInquiriesOpen && 'bg-neutral-100 text-neutral-900',
                )}
                onClick={() => setIsInquiriesOpen((current) => !current)}
              >
                {t('문의')}
                <IoChevronDown
                  className={clsx(
                    'size-4 shrink-0 transition-transform duration-150 motion-reduce:transition-none',
                    isInquiriesOpen && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>
              <Overlay
                isOpen={isInquiriesOpen}
                direction="down"
                id={inquiryMenuId}
                className={INQUIRY_CLASS}
              >
                {inquiries.map((item) => (
                  <Button
                    key={item.label}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="neutral"
                    shape="rounded"
                    aria-label={t(item.label)}
                    className="w-full justify-between px-4 py-3 no-underline"
                  >
                    <span>{t(item.label)}</span>
                    <IoOpenOutline
                      className="text-neutral-500"
                      aria-hidden="true"
                    />
                  </Button>
                ))}
              </Overlay>
            </div>
          )}
        </nav>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {actions}
        </div>
      </div>
    </HeaderFrame>
  );
}
