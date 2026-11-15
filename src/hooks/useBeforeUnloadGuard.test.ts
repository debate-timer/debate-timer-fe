import { renderHook } from '@testing-library/react';
import useBeforeUnloadGuard from './useBeforeUnloadGuard';

function requestUnload() {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

describe('브라우저 이탈 보호', () => {
  it('활성 상태에서는 새로고침·탭 닫기 확인을 요청한다', () => {
    renderHook(() => useBeforeUnloadGuard());
    expect(requestUnload().defaultPrevented).toBe(true);
  });

  it('비활성화하거나 화면을 벗어나면 확인 요청을 해제한다', () => {
    const { rerender, unmount } = renderHook(
      (enabled: boolean) => useBeforeUnloadGuard(enabled),
      { initialProps: false },
    );
    expect(requestUnload().defaultPrevented).toBe(false);
    rerender(true);
    expect(requestUnload().defaultPrevented).toBe(true);
    rerender(false);
    expect(requestUnload().defaultPrevented).toBe(false);
    rerender(true);
    unmount();
    expect(requestUnload().defaultPrevented).toBe(false);
  });
});
