import { RefObject, useEffect, useEffectEvent } from 'react';

/** 비모달 토론 패널의 바깥 클릭·Escape·포커스 이탈을 처리하며 본문 스크롤은 유지함. */
export default function useDebateOverlay(
  panel: HTMLElement | null,
  onClose: () => void,
  triggerRef: RefObject<HTMLElement | null>,
  isEnabled = true,
) {
  const handleClose = useEffectEvent(() => {
    if (isEnabled) {
      onClose();
    }
  });
  useEffect(() => {
    if (!panel || !isEnabled) {
      return;
    }
    const trigger = triggerRef.current;
    const isWithinPanel = (target: EventTarget | null) =>
      target instanceof Node &&
      (panel.contains(target) ||
        Array.from(panel.querySelectorAll('[aria-controls]')).some(
          (element) => {
            const id = element.getAttribute('aria-controls');
            return id ? document.getElementById(id)?.contains(target) : false;
          },
        ));
    const isOutside = (target: EventTarget | null) =>
      target instanceof Node &&
      !isWithinPanel(target) &&
      !trigger?.contains(target);
    const handleOutside = (event: PointerEvent | FocusEvent) => {
      if (isOutside(event.target)) {
        handleClose();
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !isWithinPanel(document.activeElement)) {
        return;
      }
      event.stopImmediatePropagation();
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
      }
      if (event.key === 'Tab') {
        const items = panel.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]',
        );
        if (
          (event.shiftKey &&
            (document.activeElement === panel ||
              document.activeElement === items[0])) ||
          (!event.shiftKey &&
            document.activeElement === items[items.length - 1])
        ) {
          event.preventDefault();
          handleClose();
          trigger?.focus();
        }
      }
    };
    window.addEventListener('pointerdown', handleOutside);
    window.addEventListener('focusin', handleOutside);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('pointerdown', handleOutside);
      window.removeEventListener('focusin', handleOutside);
      window.removeEventListener('keydown', handleKey);
      if (
        panel.contains(document.activeElement) ||
        document.activeElement === document.body
      ) {
        if (trigger?.isConnected) {
          trigger.focus();
        }
      }
    };
  }, [panel, triggerRef, isEnabled]);
}
