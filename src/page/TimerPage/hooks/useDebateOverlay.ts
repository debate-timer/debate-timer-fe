import { RefObject, useEffect } from 'react';

/** 단일 토론 오버레이에서 포커스 순환·복귀와 본문 단축키 차단을 담당함. */
export default function useDebateOverlay(
  element: HTMLElement | null,
  onClose: () => void,
  returnFocusRef?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!element) {
      return;
    }
    const previous =
      returnFocusRef?.current ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previous?.isConnected) {
        previous.focus();
      }
    };
  }, [element, returnFocusRef]);

  useEffect(() => {
    if (!element) {
      return;
    }
    const handleKey = (event: KeyboardEvent) => {
      // 포털 밖의 도움말·설정 등 다른 오버레이까지 같은 키를 처리하지 않게 함.
      event.stopImmediatePropagation();
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key !== 'Tab') {
        return;
      }
      const items = Array.from(
        element.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]',
        ),
      );
      const first = items[0];
      const last = items[items.length - 1];
      if (!first) {
        event.preventDefault();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === element)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || document.activeElement === element)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [element, onClose]);
}
