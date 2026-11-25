import { ReactNode, useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { IoChevronDown, IoClose, IoMenu, IoOpenOutline } from 'react-icons/io5';
import HeaderFrame from './HeaderFrame';
import BrandLink from './BrandLink';
import Button from '../../../components/Button/Button';
import IconButton from '../../../components/IconButton/IconButton';
import Overlay from '../../../components/Overlay/Overlay';
import useMobile from '../../../hooks/useMobile';
import { HEADER_ICON_BUTTON_CLASS } from './headerActionStyles';
import {
  buildLangPath,
  isSupportedLang,
  SupportedLang,
} from '../../../util/languageRouting';

interface NavigationItem {
  path: string;
  label: string;
  requiresAuth: boolean;
}

interface InquiryItem {
  label: string;
  url: string;
}

interface GeneralHeaderProps {
  isMember: boolean;
  canViewRecords: boolean;
  onRequireLogin: (path: string) => void;
  actions?: ReactNode;
  onIntroduction?: () => void;
  inquiries?: readonly InquiryItem[];
}

interface GeneralHeaderLinksProps {
  navigation: readonly NavigationItem[];
  selectedPath: string;
  lang: SupportedLang;
  isMember: boolean;
  onRequireLogin: (path: string) => void;
  onIntroduction?: () => void;
  onItemSelect?: () => void;
  linkClassName?: string;
}

interface InquiryLinksProps {
  inquiries: readonly InquiryItem[];
  onItemSelect?: () => void;
}

interface GeneralNavProps extends Omit<
  GeneralHeaderLinksProps,
  'onItemSelect' | 'linkClassName'
> {
  inquiries: readonly InquiryItem[];
}

const DESKTOP_LAYOUT_CLASS =
  'mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-x-6 gap-y-3';
const MOBILE_LAYOUT_CLASS =
  'mx-auto flex w-full max-w-[1600px] items-center justify-between gap-2';
const DESKTOP_NAV_CLASS = 'flex flex-wrap items-center gap-2 text-ui-label';
const LINK_CLASS =
  'inline-flex min-h-11 items-center rounded-xl px-3.5 py-2 text-neutral-700 no-underline transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 aria-[current=page]:bg-brand aria-[current=page]:text-neutral-900 aria-[current=page]:hover:bg-brand motion-reduce:transition-none';
const MOBILE_LINK_CLASS = `${LINK_CLASS} w-full`;
const INQUIRY_BUTTON_CLASS =
  'inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3.5 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 motion-reduce:transition-none';
const INQUIRY_CLASS = 'absolute left-0 z-40 mt-2 w-[320px]';
const MOBILE_MENU_PANEL_CLASS =
  'absolute top-full right-0 z-40 mt-2 w-[min(calc(100vw-2.5rem),320px)]';
const MOBILE_OPEN_TRIGGER_CLASS =
  'bg-brand/20! border-brand-hover! enabled:hover:bg-brand/30!';

/**
 * 일반 화면의 탐색과 받은 계정 조작을 배치하며 통신·로그인을 시작하지 않음.
 * 모바일(< 768px)에서는 브랜드 문구를 숨기고 우측 끝 햄버거 메뉴 Overlay에 탐색·문의를 통합함.
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
  const { i18n } = useTranslation();
  const { pathname } = useLocation();
  const isMobile = useMobile();
  const path = buildLangPath(pathname, 'ko');
  const selectedPath =
    path === '/' || path === '/templates' || path === '/records'
      ? path
      : '/dashboard';
  const lang = isSupportedLang(i18n.language) ? i18n.language : 'ko';
  const navigation: NavigationItem[] = [
    { path: '/', label: '서비스 소개', requiresAuth: false },
    { path: '/dashboard', label: '대시보드', requiresAuth: true },
    ...(isMember && canViewRecords
      ? [{ path: '/records', label: '토론 기록', requiresAuth: true }]
      : []),
    { path: '/templates', label: '템플릿', requiresAuth: false },
  ];

  return (
    <HeaderFrame>
      <div className={isMobile ? MOBILE_LAYOUT_CLASS : DESKTOP_LAYOUT_CLASS}>
        <BrandLink onNavigate={onIntroduction} hideTitleOnMobile={isMobile} />
        {!isMobile && (
          <DesktopGeneralNav
            navigation={navigation}
            selectedPath={selectedPath}
            lang={lang}
            isMember={isMember}
            onRequireLogin={onRequireLogin}
            onIntroduction={onIntroduction}
            inquiries={inquiries}
          />
        )}
        <div className="flex flex-wrap items-center justify-end gap-2">
          {actions}
          {isMobile && (
            <MobileGeneralMenu
              navigation={navigation}
              selectedPath={selectedPath}
              lang={lang}
              isMember={isMember}
              onRequireLogin={onRequireLogin}
              onIntroduction={onIntroduction}
              inquiries={inquiries}
            />
          )}
        </div>
      </div>
    </HeaderFrame>
  );
}

/** 일반 헤더의 주요 탐색 링크 목록을 렌더링함. */
function GeneralNavigationLinks(props: GeneralHeaderLinksProps) {
  const {
    navigation,
    selectedPath,
    lang,
    isMember,
    onRequireLogin,
    onIntroduction,
    onItemSelect,
    linkClassName = LINK_CLASS,
  } = props;
  const { t } = useTranslation();

  return (
    <>
      {navigation.map((item) => {
        const destination = buildLangPath(item.path, lang);
        return (
          <Link
            className={linkClassName}
            aria-current={item.path === selectedPath ? 'page' : undefined}
            key={item.path}
            to={destination}
            onClick={(event) => {
              onItemSelect?.();
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
    </>
  );
}

/** 설정된 외부 문의 링크 버튼 목록을 렌더링함. */
function GeneralInquiryLinks(props: InquiryLinksProps) {
  const { inquiries, onItemSelect } = props;
  const { t } = useTranslation();

  return (
    <>
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
          onClick={onItemSelect}
        >
          <span>{t(item.label)}</span>
          <IoOpenOutline className="text-neutral-500" aria-hidden="true" />
        </Button>
      ))}
    </>
  );
}

/** 데스크톱 일반 헤더의 인라인 탐색과 별도 문의 드롭다운을 렌더링함. */
function DesktopGeneralNav(props: GeneralNavProps) {
  const {
    navigation,
    selectedPath,
    lang,
    isMember,
    onRequireLogin,
    onIntroduction,
    inquiries,
  } = props;
  const { t } = useTranslation();
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

  return (
    <nav aria-label={t('주요 탐색')} className={DESKTOP_NAV_CLASS}>
      <GeneralNavigationLinks
        navigation={navigation}
        selectedPath={selectedPath}
        lang={lang}
        isMember={isMember}
        onRequireLogin={onRequireLogin}
        onIntroduction={onIntroduction}
      />
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
            contentClassName="space-y-2"
          >
            <GeneralInquiryLinks inquiries={inquiries} />
          </Overlay>
        </div>
      )}
    </nav>
  );
}

/** 모바일 일반 헤더의 햄버거 버튼과 탐색·문의 통합 비모달 Overlay를 렌더링함. */
function MobileGeneralMenu(props: GeneralNavProps) {
  const {
    navigation,
    selectedPath,
    lang,
    isMember,
    onRequireLogin,
    onIntroduction,
    inquiries,
  } = props;
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isMenuOpen]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isMenuOpen) {
          event.preventDefault();
          event.stopPropagation();
          setIsMenuOpen(false);
          triggerRef.current?.focus();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsMenuOpen(false);
        }
      }}
    >
      <IconButton
        ref={triggerRef}
        variant="secondary"
        shape="rounded"
        aria-label={t('메뉴')}
        title={t('메뉴')}
        aria-expanded={isMenuOpen}
        aria-controls={isMenuOpen ? menuId : undefined}
        className={clsx(
          HEADER_ICON_BUTTON_CLASS,
          isMenuOpen && MOBILE_OPEN_TRIGGER_CLASS,
        )}
        onClick={() => setIsMenuOpen((current) => !current)}
        icon={
          isMenuOpen ? (
            <IoClose aria-hidden="true" />
          ) : (
            <IoMenu aria-hidden="true" />
          )
        }
      />
      <Overlay
        isOpen={isMenuOpen}
        direction="left"
        id={menuId}
        className={MOBILE_MENU_PANEL_CLASS}
        contentClassName="p-3!"
      >
        <nav
          aria-label={t('주요 탐색')}
          className="flex flex-col gap-1 text-ui-label"
        >
          <GeneralNavigationLinks
            navigation={navigation}
            selectedPath={selectedPath}
            lang={lang}
            isMember={isMember}
            onRequireLogin={onRequireLogin}
            onIntroduction={onIntroduction}
            onItemSelect={() => setIsMenuOpen(false)}
            linkClassName={MOBILE_LINK_CLASS}
          />
        </nav>
        {inquiries.length > 0 && (
          <div className="mt-3 border-t border-neutral-200 pt-3">
            <p className="mb-2 px-3.5 text-ui-caption text-neutral-600">
              {t('문의')}
            </p>
            <div className="space-y-2">
              <GeneralInquiryLinks
                inquiries={inquiries}
                onItemSelect={() => setIsMenuOpen(false)}
              />
            </div>
          </div>
        )}
      </Overlay>
    </div>
  );
}
