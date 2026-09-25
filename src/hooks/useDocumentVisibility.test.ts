import { renderHook } from '@testing-library/react';
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

describe('useDocumentVisibility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-25T10:00:00Z'));
    setVisibilityState('visible');
  });

  afterEach(() => {
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
});
