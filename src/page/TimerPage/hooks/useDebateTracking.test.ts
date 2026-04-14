import { renderHook, act } from '@testing-library/react';
import useDebateTracking from './useDebateTracking';
import { analyticsManager } from '../../../util/analytics';

vi.mock('../../../util/analytics', () => ({
  analyticsManager: {
    trackEvent: vi.fn(),
    flush: vi.fn(),
  },
}));

describe('useDebateTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('trackTimerStarted 호출 시 timer_started 이벤트가 발생한다', () => {
    const { result } = renderHook(() => useDebateTracking());
    act(() => {
      result.current.trackTimerStarted({ table_id: 1, total_rounds: 5 });
    });
    expect(analyticsManager.trackEvent).toHaveBeenCalledWith(
      'timer_started',
      expect.objectContaining({ table_id: 1, total_rounds: 5 }),
    );
  });

  test('trackDebateCompleted 호출 시 debate_completed 이벤트가 발생한다', () => {
    const { result } = renderHook(() => useDebateTracking());
    act(() => {
      result.current.trackDebateCompleted({ table_id: 1, total_rounds: 5 });
    });
    expect(analyticsManager.trackEvent).toHaveBeenCalledWith(
      'debate_completed',
      expect.objectContaining({ table_id: 1, total_rounds: 5 }),
    );
  });

  test('토론 시작 후 언마운트 시 debate_abandoned 이벤트가 발생한다', () => {
    const { result, unmount } = renderHook(() => useDebateTracking());
    act(() => {
      result.current.trackTimerStarted({ table_id: 1, total_rounds: 5 });
    });
    vi.mocked(analyticsManager.trackEvent).mockClear();

    act(() => {
      result.current.updateProgress(2, 5);
    });
    unmount();

    expect(analyticsManager.trackEvent).toHaveBeenCalledWith(
      'debate_abandoned',
      expect.objectContaining({
        table_id: 1,
        current_round: 2,
        total_rounds: 5,
        abandon_type: 'navigation',
      }),
    );
  });

  test('토론 완료 후 언마운트 시 debate_abandoned가 발생하지 않는다', () => {
    const { result, unmount } = renderHook(() => useDebateTracking());
    act(() => {
      result.current.trackTimerStarted({ table_id: 1, total_rounds: 5 });
      result.current.trackDebateCompleted({ table_id: 1, total_rounds: 5 });
    });
    vi.mocked(analyticsManager.trackEvent).mockClear();

    unmount();

    const abandonCalls = vi
      .mocked(analyticsManager.trackEvent)
      .mock.calls.filter(
        (call: [string, ...unknown[]]) => call[0] === 'debate_abandoned',
      );
    expect(abandonCalls).toHaveLength(0);
  });
});
