import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { DropdownMenuItem } from '../../../components/DropdownMenu/DropdownMenu'; // DropdownMenuItem 타입 재사용
import DTExpand from '../../../components/icons/Expand';

export default function LanguageSelector() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang: currentLangParam } = useParams();

  const LANG_OPTIONS: DropdownMenuItem<string>[] = [
    { value: 'ko', label: 'KR' },
    { value: 'en', label: 'EN' },
  ];

  // URL 파라미터를 기반으로 현재 선택된 언어 결정
  // 유효한 언어 파라미터가 없으면 'ko'를 기본값으로 사용
  const selectedLangValue =
    LANG_OPTIONS.find((option) => option.value === currentLangParam)?.value ||
    'ko';
  const selectedLangLabel =
    LANG_OPTIONS.find((option) => option.value === selectedLangValue)?.label ||
    'KR';

  const handleLanguageChange = (newLang: string) => {
    const currentPathname = location.pathname;
    const pathSegments = currentPathname.split('/'); // 현재 경로를 '/' 기준으로 분리합니다.
    const hasLangSegment =
      pathSegments.length > 1 &&
      pathSegments[1] &&
      LANG_OPTIONS.some((opt) => opt.value === pathSegments[1]);

    let newPathname = currentPathname;
    if (newLang === 'ko') {
      if (hasLangSegment) {
        pathSegments.splice(1, 1);
        newPathname = pathSegments.join('/') || '/';
      }
      navigate(newPathname);
      return;
    }

    // 현재 경로에 언어 세그먼트가 있는지 확인하고 대체하거나 추가합니다.
    if (hasLangSegment) {
      // 현재 경로에 언어 세그먼트가 있다면, 새 언어로 대체합니다.
      pathSegments[1] = newLang;
      newPathname = pathSegments.join('/');
    } else {
      // 현재 경로에 언어 세그먼트가 없다면 (예: '/', '/home'), 새 언어를 경로 앞에 추가합니다.
      newPathname = `/${newLang}${currentPathname === '/' ? '' : currentPathname}`;
    }

    navigate(newPathname);
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const triggerButtonClasses = clsx(
    'flex h-full cursor-pointer items-center justify-center gap-[8px] px-[4px] font-semibold leading-none text-default-black',
  );

  const menuPanelClasses = clsx(
    'absolute right-0 top-full z-10 mt-[16px] flex w-[68px] origin-top transform flex-col overflow-hidden border border-default-disabled/hover bg-default-white shadow-[0_3px_5px_rgba(0,0,0,0.2)] transition-opacity transition-transform duration-200 ease-out',
    {
      'opacity-100 scale-y-100 pointer-events-auto': isMenuOpen,
      'opacity-0 scale-y-95 pointer-events-none': !isMenuOpen,
    },
  );

  const menuItemClasses = (value: string) =>
    clsx(
      'flex cursor-pointer items-center justify-center p-[10px] text-center text-body-raw font-semibold transition-colors duration-150 last:border-b-0 md:text-subtitle-raw',
      {
        'text-default-black': value === selectedLangValue,
        'text-default-neutral': value !== selectedLangValue,
      },
    );

  return (
    <div
      className="relative flex h-full items-center justify-center"
      ref={menuRef}
    >
      {/* 언어 선택 트리거 버튼 */}
      <button
        type="button"
        className={triggerButtonClasses}
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isMenuOpen}
        aria-label="언어 선택"
      >
        {/* 현재 선택된 언어 표시 */}
        <span className="text-body-raw font-semibold md:text-subtitle-raw">
          {selectedLangLabel}
        </span>{' '}
        {/* 확장/축소 아이콘 */}
        <DTExpand
          className={clsx('w-[12px] transition-transform duration-200', {
            'rotate-180': isMenuOpen,
          })}
        />{' '}
      </button>

      {/* 언어 선택 메뉴 패널 */}
      <div className={menuPanelClasses} role="listbox">
        {LANG_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={menuItemClasses(option.value)}
            onClick={() => {
              handleLanguageChange(option.value);
              setIsMenuOpen(false);
            }}
            role="option"
            aria-selected={option.value === selectedLangValue}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
