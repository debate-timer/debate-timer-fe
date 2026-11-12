/** 오버레이와 기본 조작의 키보드 입력을 본문 단축키가 가로채지 않게 함. */
export default function shouldIgnoreTimerHotkey(event: KeyboardEvent): boolean {
  return (
    event.defaultPrevented ||
    event.isComposing ||
    document.querySelector(
      '[data-timer-overlay], [role="dialog"], [role="alertdialog"]',
    ) !== null ||
    (event.target instanceof HTMLElement &&
      event.target.closest(
        'input,textarea,select,button,a,[contenteditable="true"],[role="button"]',
      ) !== null)
  );
}
