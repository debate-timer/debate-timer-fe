import { renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useDocumentVisibility from './useDocumentVisibility';

function setVisibilityState(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  });
}

function fireVisibilityChange(state: DocumentVisibilityState) {
  setVisibilityState(state);
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('탭 표시 상태 감지', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-25T10:00:00Z'));
    setVisibilityState('visible');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('탭이 다시 보이게 되면 콜백을 실행한다', () => {
    const onVisible = vi.fn();
    renderHook(() => useDocumentVisibility(onVisible));

    fireVisibilityChange('visible');

    expect(onVisible).toHaveBeenCalledTimes(1);
  });

  it('탭이 숨겨질 때는 콜백을 실행하지 않는다', () => {
    const onVisible = vi.fn();
    renderHook(() => useDocumentVisibility(onVisible));

    fireVisibilityChange('hidden');

    expect(onVisible).not.toHaveBeenCalled();
  });

  it('스로틀 시간 안의 재실행은 건너뛴다', () => {
    const onVisible = vi.fn();
    renderHook(() => useDocumentVisibility(onVisible, { throttleMs: 1000 }));

    fireVisibilityChange('visible');
    vi.advanceTimersByTime(999);
    fireVisibilityChange('visible');

    expect(onVisible).toHaveBeenCalledTimes(1);
  });

  it('스로틀 시간이 지나면 다시 실행한다', () => {
    const onVisible = vi.fn();
    renderHook(() => useDocumentVisibility(onVisible, { throttleMs: 1000 }));

    fireVisibilityChange('visible');
    vi.advanceTimersByTime(1000);
    fireVisibilityChange('visible');

    expect(onVisible).toHaveBeenCalledTimes(2);
  });

  it('비활성화하면 콜백을 실행하지 않는다', () => {
    const onVisible = vi.fn();
    renderHook(() => useDocumentVisibility(onVisible, { enabled: false }));

    fireVisibilityChange('visible');

    expect(onVisible).not.toHaveBeenCalled();
  });

  it('언마운트하면 리스너를 제거한다', () => {
    const onVisible = vi.fn();
    const { unmount } = renderHook(() => useDocumentVisibility(onVisible));

    unmount();
    fireVisibilityChange('visible');

    expect(onVisible).not.toHaveBeenCalled();
  });

  it('콜백만 바뀌면 리스너를 재등록하지 않고 최신 콜백을 실행한다', () => {
    const previousCallback = vi.fn();
    const latestCallback = vi.fn();
    const addListener = vi.spyOn(document, 'addEventListener');
    const removeListener = vi.spyOn(document, 'removeEventListener');
    const { rerender } = renderHook(
      ({ onVisible }) => useDocumentVisibility(onVisible),
      { initialProps: { onVisible: previousCallback } },
    );
    const registrations = () =>
      addListener.mock.calls.filter(([event]) => event === 'visibilitychange');
    const removals = () =>
      removeListener.mock.calls.filter(
        ([event]) => event === 'visibilitychange',
      );
    const initialRegistrations = registrations().length;

    rerender({ onVisible: latestCallback });
    fireVisibilityChange('visible');

    expect(previousCallback).not.toHaveBeenCalled();
    expect(latestCallback).toHaveBeenCalledOnce();
    expect(registrations()).toHaveLength(initialRegistrations);
    expect(removals()).toHaveLength(0);
  });

  it('활성 옵션 변경에 따라 감지를 중단하고 다시 시작한다', () => {
    const onVisible = vi.fn();
    const { rerender } = renderHook(
      ({ enabled }) => useDocumentVisibility(onVisible, { enabled }),
      { initialProps: { enabled: true } },
    );

    rerender({ enabled: false });
    fireVisibilityChange('visible');
    expect(onVisible).not.toHaveBeenCalled();

    rerender({ enabled: true });
    fireVisibilityChange('visible');
    expect(onVisible).toHaveBeenCalledOnce();
  });

  it('실행 제한 시간을 바꿔도 마지막 실행 시각을 보존한다', () => {
    const onVisible = vi.fn();
    const { rerender } = renderHook(
      ({ throttleMs }) => useDocumentVisibility(onVisible, { throttleMs }),
      { initialProps: { throttleMs: 1000 } },
    );

    fireVisibilityChange('visible');
    vi.advanceTimersByTime(500);
    rerender({ throttleMs: 2000 });
    fireVisibilityChange('visible');
    expect(onVisible).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1500);
    fireVisibilityChange('visible');
    expect(onVisible).toHaveBeenCalledTimes(2);
  });

  it('Strict Mode 재실행과 재마운트에서 중복 호출이나 남은 리스너가 없다', () => {
    const onVisible = vi.fn();
    const mount = () =>
      renderHook(() => useDocumentVisibility(onVisible), {
        wrapper: StrictMode,
      });
    const firstMount = mount();

    fireVisibilityChange('visible');
    expect(onVisible).toHaveBeenCalledTimes(1);
    firstMount.unmount();
    vi.advanceTimersByTime(1000);
    fireVisibilityChange('visible');
    expect(onVisible).toHaveBeenCalledTimes(1);

    const secondMount = mount();
    fireVisibilityChange('visible');
    expect(onVisible).toHaveBeenCalledTimes(2);
    secondMount.unmount();
    vi.advanceTimersByTime(1000);
    fireVisibilityChange('visible');
    expect(onVisible).toHaveBeenCalledTimes(2);
  });
});
