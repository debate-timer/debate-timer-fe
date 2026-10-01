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
    canSwitchCamp: true,
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

  it.each(['Enter', 'NumpadEnter'])(
    '상대 팀 시간이 모두 소진되어 진영을 전환할 수 없으면 %s 키로 TEAM_SWITCH를 발행하지 않는다',
    (code) => {
      const onEvent = vi.fn();
      const state = {
        ...createState(),
        data: { table: [{ boxType: 'TIME_BASED' }] },
        canSwitchCamp: false,
      } as unknown as TimerPageLogics;
      renderHook(() => useTimerHotkey(state, onEvent));

      pressKey(code);

      expect(onEvent).not.toHaveBeenCalled();
    },
  );

  it('진영을 전환할 수 있으면 Enter 키로 TEAM_SWITCH를 발행한다', () => {
    const onEvent = vi.fn();
    const state = {
      ...createState(),
      data: { table: [{ boxType: 'TIME_BASED' }] },
      canSwitchCamp: true,
    } as unknown as TimerPageLogics;
    renderHook(() => useTimerHotkey(state, onEvent));

    pressKey('Enter');

    expect(onEvent).toHaveBeenCalledWith(state.switchCamp, 'TEAM_SWITCH');
  });

  it('반대 팀 시간이 모두 소진되었으면 L 키는 반대 팀 타이머를 확인해 진영 전환 없이 선택만 옮긴다', () => {
    const onEvent = vi.fn();
    const state = {
      ...createState(),
      data: { table: [{ boxType: 'TIME_BASED' }] },
      prosConsSelected: 'PROS',
      timer1: { isRunning: false, isDone: false },
      timer2: { isRunning: false, isDone: true },
      canSwitchCamp: false,
    } as unknown as TimerPageLogics;
    renderHook(() => useTimerHotkey(state, onEvent));

    pressKey('KeyL');
    const [invoke, eventType] = onEvent.mock.calls[0];
    invoke();

    expect(eventType).toBe('TEAM_SWITCH');
    expect(state.setProsConsSelected).toHaveBeenCalledWith('CONS');
    expect(state.switchCamp).not.toHaveBeenCalled();
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
