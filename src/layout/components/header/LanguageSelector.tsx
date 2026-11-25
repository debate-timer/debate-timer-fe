import { KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { IoChevronDown } from 'react-icons/io5';
import Button from '../../../components/Button/Button';
import Overlay from '../../../components/Overlay/Overlay';
import { HEADER_BUTTON_CLASS } from './headerActionStyles';
import {
  buildLangPath,
  getSelectedLangFromRoute,
  SupportedLang,
} from '../../../util/languageRouting';
import useGlobalSettings from '../../../hooks/useGlobalSettings';

const OPTIONS = [
  { value: 'ko', label: 'KR', name: '한국어' },
  { value: 'en', label: 'EN', name: 'English' },
] as const;
const PANEL_CLASS = 'absolute top-full right-0 z-40 mt-2 min-w-28';
const OPTION_CLASS =
  'flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 text-ui-label text-neutral-900 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-brand-hover motion-reduce:transition-none';

/** 명시적 언어 선택을 공용 설정에 저장하고 URL과 기존 방문 문맥을 함께 보존함. */
export default function LanguageSelector() {
  const { t } = useTranslation();
  const { controller } = useGlobalSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const selected = getSelectedLangFromRoute(undefined, location.pathname);
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    rootRef.current
      ?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
      ?.focus();
    const handleOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, [isOpen]);

  const handleSelect = (lang: SupportedLang) => {
    controller.change({ language: lang });
    void controller.flush();
    navigate(
      `${buildLangPath(location.pathname, lang)}${location.search}${location.hash}`,
      { state: location.state },
    );
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
      triggerRef.current?.focus();
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (!isOpen) {
      setIsOpen(true);
      return;
    }
    const options = Array.from(
      rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ??
        [],
    );
    const index = options.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? options.length - 1
          : event.key === 'ArrowDown'
            ? Math.min(index + 1, options.length - 1)
            : Math.max(index - 1, 0);
    options[next]?.focus();
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      data-timer-overlay={isOpen ? '' : undefined}
      onKeyDown={handleKey}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <Button
        ref={triggerRef}
        variant="secondary"
        shape="rounded"
        aria-label={t('언어 선택')}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        className={clsx(HEADER_BUTTON_CLASS, 'gap-1.5!')}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{selected === 'ko' ? 'KR' : 'EN'}</span>
        <IoChevronDown
          className={clsx(
            'size-4! shrink-0 text-neutral-500 transition-transform duration-150 motion-reduce:transition-none',
            isOpen && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </Button>
      <Overlay
        isOpen={isOpen}
        direction="down"
        id={listId}
        role="listbox"
        aria-label={t('언어 선택')}
        className={PANEL_CLASS}
        contentClassName="space-y-1 p-1.5!"
      >
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-label={t(option.name)}
            aria-selected={option.value === selected}
            tabIndex={option.value === selected ? 0 : -1}
            className={clsx(
              OPTION_CLASS,
              option.value === selected && 'bg-brand/30',
            )}
            onClick={() => handleSelect(option.value)}
          >
            <span>{option.label}</span>
            <span aria-hidden="true" className="w-4 text-center">
              {option.value === selected ? '✓' : ''}
            </span>
          </button>
        ))}
      </Overlay>
    </div>
  );
}
