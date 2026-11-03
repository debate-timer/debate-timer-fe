import { act, renderHook } from '@testing-library/react';
import useActiveStep from './useActiveStep';

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

describe('화면 가운데 단계 추적', () => {
  let trigger: ObserverCallback;
  const observe = vi.fn();
  const disconnect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: ObserverCallback) {
          trigger = callback;
        }
        observe = observe;
        disconnect = disconnect;
        unobserve = vi.fn();
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const createContainer = () => {
    const container = document.createElement('ol');
    ['prepare', 'start', 'run'].forEach((id) => {
      const item = document.createElement('li');
      item.dataset.stepId = id;
      container.appendChild(item);
    });
    return container;
  };

  it('처음에는 첫 단계를 현재 단계로 본다', () => {
    const container = createContainer();
    const { result } = renderHook(() =>
      useActiveStep({ current: container }, ['prepare', 'start', 'run']),
    );

    expect(result.current).toBe('prepare');
    expect(observe).toHaveBeenCalledTimes(3);
  });

  it('화면 가운데에 들어온 단계를 현재 단계로 바꾼다', () => {
    const container = createContainer();
    const { result } = renderHook(() =>
      useActiveStep({ current: container }, ['prepare', 'start', 'run']),
    );

    act(() =>
      trigger([
        { isIntersecting: false, target: container.children[0] },
        { isIntersecting: true, target: container.children[2] },
      ]),
    );

    expect(result.current).toBe('run');
  });

  it('언마운트하면 관찰을 멈춘다', () => {
    const container = createContainer();
    const { unmount } = renderHook(() =>
      useActiveStep({ current: container }, ['prepare', 'start', 'run']),
    );

    unmount();

    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('IntersectionObserver가 없는 환경에서는 첫 단계를 유지한다', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { result } = renderHook(() =>
      useActiveStep({ current: createContainer() }, ['prepare', 'start']),
    );

    expect(result.current).toBe('prepare');
  });
});
