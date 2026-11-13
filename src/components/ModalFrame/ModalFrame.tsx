import { useTranslation } from 'react-i18next';
import {
  AriaAttributes,
  ReactNode,
  useRef,
  useLayoutEffect,
  useEffectEvent,
} from 'react';
import DTClose from '../icons/Close';
export interface ModalWrapperProps extends Pick<
  AriaAttributes,
  'aria-label' | 'aria-labelledby' | 'aria-describedby'
> {
  children: ReactNode;
  showCloseButton?: boolean;
  /** 자식이 대화상자 역할과 이름을 이미 제공하는 경우 중첩 역할을 생략함. */
  hasDialogContent?: boolean;
}

interface ModalFrameProps extends ModalWrapperProps {
  onClose: () => void;
  closeOnOverlayClick: boolean;
}

const OPEN_MODALS: HTMLElement[] = [];
const CLOSE_BUTTON_CLASS =
  'flex size-11 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 motion-reduce:transition-none';
const FOCUSABLE_SELECTOR =
  'button, input, select, textarea, a[href], [tabindex], [contenteditable="true"]';

function getFocusableElements(panel: HTMLElement) {
  return Array.from(
    panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => {
    const isHidden = (candidate: HTMLElement | null): boolean => {
      if (!candidate) {
        return false;
      }
      const style = getComputedStyle(candidate);
      return (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        (candidate !== panel && isHidden(candidate.parentElement))
      );
    };
    return (
      element.tabIndex >= 0 &&
      !element.matches(':disabled, input[type="hidden"]') &&
      !element.closest('[hidden], [inert]') &&
      !isHidden(element)
    );
  });
}

/**
 * 포털에 실제 마운트된 열린 창의 포커스와 최상위 닫기를 관리함.
 *
 * `ModalWrapper`의 X 닫기 버튼은 본문과 겹치지 않는 상단 영역에 배치함. 아이콘은 20px, 조작 영역은 44px이며 둥근 호버 배경과 키보드 포커스 표시를 제공함. 기본 아이콘은 `neutral-500`, 호버 시 `neutral-900`과 `neutral-100` 배경을 사용함. 버튼을 숨기면 상단 영역도 제거함.
 *
 */
export default function ModalFrame(props: ModalFrameProps) {
  const {
    children,
    onClose,
    closeOnOverlayClick,
    showCloseButton,
    hasDialogContent = false,
    'aria-label': label,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
  } = props;
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const handleClose = useEffectEvent(onClose);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    OPEN_MODALS.push(panel);
    const isTopModal = () => OPEN_MODALS[OPEN_MODALS.length - 1] === panel;
    const focusFirst = () => (getFocusableElements(panel)[0] ?? panel).focus();
    focusFirst();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isTopModal() || event.defaultPrevented) {
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        handleClose();
      } else if (event.key === 'Tab') {
        const elements = getFocusableElements(panel);
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (!first) {
          event.preventDefault();
          panel.focus();
        } else if (
          event.shiftKey &&
          (document.activeElement === first || document.activeElement === panel)
        ) {
          event.preventDefault();
          last?.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last || document.activeElement === panel)
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const handleFocusIn = (event: FocusEvent) => {
      if (
        isTopModal() &&
        event.target instanceof Node &&
        !panel.contains(event.target)
      ) {
        focusFirst();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);
    return () => {
      const wasTopModal = isTopModal();
      OPEN_MODALS.splice(OPEN_MODALS.indexOf(panel), 1);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
      if (wasTopModal && previousFocus?.isConnected) {
        previousFocus.focus();
      }
    };
  }, []);

  return (
    <div
      data-timer-overlay
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(event) => {
        event.stopPropagation();
        if (
          event.target === event.currentTarget &&
          closeOnOverlayClick &&
          OPEN_MODALS[OPEN_MODALS.length - 1] === panelRef.current
        ) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role={hasDialogContent ? undefined : 'dialog'}
        aria-modal={hasDialogContent ? undefined : true}
        aria-label={
          hasDialogContent || labelledBy ? undefined : (label ?? t('대화상자'))
        }
        aria-labelledby={hasDialogContent ? undefined : labelledBy}
        aria-describedby={hasDialogContent ? undefined : describedBy}
        className="relative overflow-hidden rounded-[20px] bg-white shadow-lg outline-none"
      >
        {showCloseButton && (
          <div className="flex justify-end px-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className={CLOSE_BUTTON_CLASS}
              aria-label={t('모달 닫기')}
            >
              <DTClose className="size-5" aria-hidden="true" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
