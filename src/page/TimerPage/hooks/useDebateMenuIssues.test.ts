import { act, renderHook } from '@testing-library/react';
import useDebateMenuIssues from './useDebateMenuIssues';

const INITIAL: Parameters<typeof useDebateMenuIssues>[0] = {
  canShare: true,
  share: { isSharing: false, isLoading: false, isError: false },
  transcript: {
    sttMode: 'MULTI_DEVICE',
    isEnabled: true,
    error: null,
    failedCount: 3,
    multiDeviceSession: { sessionKey: 'first', joinCode: 'code' },
  },
};

it('다기기 공유 안내를 연결 중·공유 중·오류 중에는 숨기고 같은 세션에서 한 번만 알린다', () => {
  const { result, rerender } = renderHook(useDebateMenuIssues, {
    initialProps: INITIAL,
  });
  expect(result.current.hasUnseenShareAdvice).toBe(true);
  (['isLoading', 'isSharing', 'isError'] as const).forEach((condition) => {
    rerender({ ...INITIAL, share: { ...INITIAL.share, [condition]: true } });
    expect(result.current.hasShareAdvice).toBe(false);
  });
  rerender(INITIAL);
  act(() => result.current.acknowledgeShareAdvice());
  rerender({ ...INITIAL, share: { ...INITIAL.share, isSharing: true } });
  rerender(INITIAL);
  expect(result.current.hasUnseenShareAdvice).toBe(false);
});

it('실패 카운터가 초기화되면 이전 확인 횟수를 적용하지 않는다', () => {
  const { result, rerender } = renderHook(useDebateMenuIssues, {
    initialProps: INITIAL,
  });
  act(() => result.current.acknowledgeFailures());
  expect(result.current.hasUnseenFailures).toBe(false);
  rerender({
    ...INITIAL,
    transcript: { ...INITIAL.transcript, failedCount: 0 },
  });
  expect(result.current.hasUnseenFailures).toBe(false);
  rerender({
    ...INITIAL,
    transcript: { ...INITIAL.transcript, failedCount: 1 },
  });
  expect(result.current.hasUnseenFailures).toBe(true);
});
