import { act, fireEvent, renderHook } from '@testing-library/react';
import { useAnswerTimer } from './useAnswerTimer';
import { useNormalTimer } from './useNormalTimer';
import { useTimeBasedTimer } from './useTimeBasedTimer';
import { DebateTableData } from '../../../types/type';

describe('답변 타이머 제어', () => {
  afterEach(() => vi.useRealTimers());
  function useSubject(options: {
    isEnabled: boolean;
    answerTime: number;
    index?: number;
  }) {
    const normal = useNormalTimer();
    const pros = useTimeBasedTimer();
    const cons = useTimeBasedTimer();
    return useAnswerTimer({
      ...options,
      index: options.index ?? 0,
      data: {
        table: [{ boxType: 'NORMAL' }, { boxType: 'NORMAL' }],
      } as DebateTableData,
      normalTimer: { ...normal, isRunning: true },
      timer1: pros,
      timer2: cons,
      prosConsSelected: 'PROS',
    });
  }
  it('끄면 초기화하고 버튼과 Shift로 시작하지 않는다', () => {
    const { result, rerender } = renderHook(useSubject, {
      initialProps: { isEnabled: true, answerTime: 30 },
    });
    act(() => result.current.handleClickAnswerTimer('NORMAL', true));
    rerender({ isEnabled: false, answerTime: 30 });
    act(() => result.current.handleClickAnswerTimer('NORMAL', true));
    fireEvent.keyDown(window, { code: 'ShiftLeft' });
    expect(result.current.answerTimerState).toBeNull();
  });
  it('제한 축소는 즉시 완료하고 확대는 경과 시간을 보존하며 차례 변경은 초기화한다', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(useSubject, {
      initialProps: { isEnabled: true, answerTime: 30, index: 0 },
    });
    act(() => result.current.handleClickAnswerTimer('NORMAL', true));
    act(() => vi.advanceTimersByTime(20000));
    rerender({ isEnabled: true, answerTime: 60, index: 0 });
    expect(result.current.answerTimerState?.elapsedTime).toBe(20);
    rerender({ isEnabled: true, answerTime: 15, index: 0 });
    expect(result.current.answerTimerState).toMatchObject({
      elapsedTime: 15,
      status: 'stopped',
    });
    rerender({ isEnabled: true, answerTime: 15, index: 1 });
    expect(result.current.answerTimerState).toBeNull();
  });
});
