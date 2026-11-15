import { useTranslation } from 'react-i18next';
import {
  CSSProperties,
  KeyboardEvent,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useId,
} from 'react';
import { createPortal } from 'react-dom';
import DTExpand from '../icons/Expand';
import clsx from 'clsx';

export interface DropdownMenuItem<T> {
  value: T;
  label: string;
}

interface DropdownMenuProps<T> {
  options: DropdownMenuItem<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  renderInPortal?: boolean;
  className?: string;
  'aria-label'?: string;
}

const BUTTON_CLASS =
  'form-control-border flex h-12 w-full items-center justify-between gap-4 bg-white px-3 text-left text-ui-body text-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500';
const MENU_CLASS =
  'overflow-y-auto rounded-lg border border-neutral-200 bg-white p-1 shadow-md';
const MENU_MAX_HEIGHT = 240;
const MENU_GAP = 4;
const VIEWPORT_MARGIN = 8;
const OPTION_CLASS =
  'flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-2 text-left text-ui-body text-neutral-900 hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-2 focus:-outline-offset-2 focus:outline-brand/60';

/**
 * 호출자의 선택값을 표시하고 단일 선택과 키보드 조작을 제공함.
 *
 * renderInPortal은 스크롤 컨테이너의 잘림을 피하도록 목록을 body에 고정 배치함.
 * 버튼의 위치·너비를 따라가며 공간이 부족하면 위로 펼침. 스크롤·화면 크기 변경 시 위치를 갱신함.
 * aria-controls로 호출 영역과 목록의 관계를 제공하며 Tab은 버튼 다음 조작으로 이동함.
 * 공용 `DropdownMenu`는 `options`·`selectedValue`·`onSelect`로 단일 선택을 제공함. 호출자는 번역된 `aria-label`로 입력 목적을 전달함. 열림 시 선택 항목에 포커스하며 방향키·Home·End는 이동만, Enter·Space는 선택을 수행함. Escape는 취소하고 버튼으로 복귀하며 Tab은 다음 입력으로, Shift+Tab은 버튼으로 이동하면서 닫힘. 외부 포인터 조작·포커스 이탈도 목록을 닫으며 빈 목록과 비활성 상태에서는 열리지 않음. 긴 목록은 내부 스크롤로 표시함.
 *
 */
export default function DropdownMenu<T>(props: DropdownMenuProps<T>) {
  const {
    options,
    selectedValue,
    onSelect,
    placeholder,
    disabled = false,
    renderInPortal = false,
    className,
    'aria-label': ariaLabel,
  } = props;
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const selectedIndex = options.findIndex(
    (option) => option.value === selectedValue,
  );
  const selectedOptionLabel =
    options[selectedIndex]?.label ?? placeholder ?? t('선택');
  const isOpen = activeIndex !== null && !disabled && options.length > 0;

  useLayoutEffect(() => {
    if (!isOpen || !renderInPortal) {
      return;
    }
    const positionMenu = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      const below = Math.max(
        0,
        window.innerHeight - rect.bottom - MENU_GAP - VIEWPORT_MARGIN,
      );
      const above = Math.max(0, rect.top - MENU_GAP - VIEWPORT_MARGIN);
      const shouldOpenAbove =
        below <
          Math.min(
            MENU_MAX_HEIGHT,
            menuRef.current?.scrollHeight ?? MENU_MAX_HEIGHT,
          ) && above > below;
      setMenuStyle({
        left: rect.left,
        width: rect.width,
        top: shouldOpenAbove ? undefined : rect.bottom + MENU_GAP,
        bottom: shouldOpenAbove
          ? window.innerHeight - rect.top + MENU_GAP
          : undefined,
        maxHeight: Math.min(MENU_MAX_HEIGHT, shouldOpenAbove ? above : below),
      });
    };
    positionMenu();
    window.addEventListener('resize', positionMenu);
    window.addEventListener('scroll', positionMenu, true);
    return () => {
      window.removeEventListener('resize', positionMenu);
      window.removeEventListener('scroll', positionMenu, true);
    };
  }, [isOpen, renderInPortal]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleClickOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !dropdownRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setActiveIndex(null);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () =>
      document.removeEventListener('pointerdown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (disabled || options.length === 0) {
      setActiveIndex(null);
    } else if (isOpen && activeIndex !== null) {
      const index = Math.min(activeIndex, options.length - 1);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
      optionRefs.current[index]?.focus({ preventScroll: true });
      optionRefs.current[index]?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [activeIndex, isOpen, disabled, options.length]);

  const handleOpen = (fromEnd = false) => {
    if (!disabled && options.length > 0) {
      setActiveIndex(
        selectedIndex >= 0 ? selectedIndex : fromEnd ? options.length - 1 : 0,
      );
    }
  };
  const handleClose = () => {
    setActiveIndex(null);
    buttonRef.current?.focus();
  };
  const handleSelect = (value: T) => {
    handleClose();
    onSelect(value);
  };
  const handleListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = activeIndex ?? 0;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(Math.min(index + 1, options.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(Math.max(index - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        handleClose();
        break;
      case 'Tab':
        if (event.shiftKey) {
          event.preventDefault();
          handleClose();
        } else if (renderInPortal) {
          event.preventDefault();
          const items = Array.from(
            document.querySelectorAll<HTMLElement>(
              'button,input,select,textarea,a[href],[tabindex]',
            ),
          ).filter((element) => {
            if (
              element.tabIndex < 0 ||
              element.matches(':disabled') ||
              element.closest('[hidden],[inert]')
            ) {
              return false;
            }
            const style = getComputedStyle(element);
            return style.display !== 'none' && style.visibility !== 'hidden';
          });
          const index = items.indexOf(buttonRef.current!);
          handleClose();
          items[index + 1]?.focus();
        }
        break;
    }
  };

  const menu = (
    <div
      ref={menuRef}
      id={`${id}-listbox`}
      role="listbox"
      aria-labelledby={`${id}-trigger`}
      className={clsx(
        MENU_CLASS,
        renderInPortal ? 'fixed z-[60]' : 'absolute z-20 mt-1 max-h-60 w-full',
      )}
      style={renderInPortal ? menuStyle : undefined}
      onKeyDown={handleListKeyDown}
    >
      {options.map((option, index) => (
        <button
          key={index}
          ref={(element) => {
            optionRefs.current[index] = element;
          }}
          type="button"
          role="option"
          aria-label={option.label}
          aria-selected={option.value === selectedValue}
          tabIndex={-1}
          className={clsx(
            OPTION_CLASS,
            option.value === selectedValue && 'bg-brand/20',
          )}
          onFocus={() => setActiveIndex(index)}
          onClick={() => handleSelect(option.value)}
        >
          <span className="min-w-0 wrap-break-word">{option.label}</span>
          <span aria-hidden="true" className="w-4 shrink-0 text-center">
            {option.value === selectedValue ? '✓' : ''}
          </span>
        </button>
      ))}
    </div>
  );
  return (
    <div
      className={clsx('relative min-w-0', className)}
      ref={dropdownRef}
      onBlur={(event) => {
        if (
          !event.currentTarget.contains(event.relatedTarget) &&
          !menuRef.current?.contains(event.relatedTarget)
        ) {
          setActiveIndex(null);
        }
      }}
    >
      <button
        ref={buttonRef}
        id={`${id}-trigger`}
        type="button"
        aria-label={
          ariaLabel
            ? `${ariaLabel}, ${selectedOptionLabel}`
            : selectedOptionLabel
        }
        aria-haspopup="listbox"
        aria-controls={isOpen ? `${id}-listbox` : undefined}
        aria-expanded={isOpen}
        disabled={disabled}
        className={BUTTON_CLASS}
        onClick={() => (isOpen ? handleClose() : handleOpen())}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            handleOpen(event.key === 'ArrowUp');
          }
        }}
      >
        <span
          className={clsx('truncate', selectedIndex < 0 && 'text-neutral-500')}
          title={selectedOptionLabel}
        >
          {selectedOptionLabel}
        </span>
        <DTExpand
          aria-hidden="true"
          className={clsx(
            'w-3 shrink-0 text-neutral-400 transition-transform duration-150 motion-reduce:transition-none',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      {isOpen && (renderInPortal ? createPortal(menu, document.body) : menu)}
    </div>
  );
}
