import { renderHook } from '@testing-library/react';
import { useTimerHotkey } from './useTimerHotkey';
import { TimerPageLogics } from './useTimerPageState';

function createState(): TimerPageLogics {
  return {
    data: {
      table: [{ boxType: 'NORMAL' }],
    },
    index: 0,
    prosConsSelected: 'PROS',
    timer1: { isRunning: false },
    timer2: { isRunning: false },
    normalTimer: {
      isRunning: false,
      startTimer: vi.fn(),
      pauseTimer: vi.fn(),
      resetTimer: vi.fn(),
    },
    goToOtherItem: vi.fn(),
    setProsConsSelected: vi.fn(),
    switchCamp: vi.fn(),
  } as unknown as TimerPageLogics;
}

describe('useTimerHotkey', () => {
  const pressKey = (code: string, options: KeyboardEventInit = {}) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code, ...options }));
  };

  it('Space를 누르면 재생 이벤트를 발생시킨다', () => {
    const onEvent = vi.fn();
    renderHook(() => useTimerHotkey(createState(), onEvent));

    pressKey('Space');

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith(expect.any(Function), 'PLAY');
  });

  it.each(['Space', 'Enter', 'KeyR'])(
    '%s 키를 길게 눌러 반복 입력되면 무시한다',
    (code) => {
      const onEvent = vi.fn();
      renderHook(() => useTimerHotkey(createState(), onEvent));

      pressKey(code);
      pressKey(code, { repeat: true });
      pressKey(code, { repeat: true });

      expect(onEvent).toHaveBeenCalledTimes(1);
    },
  );
});
