import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLiveShare } from './useLiveShare';

const useChairmanSocketMock = vi.hoisted(() => vi.fn());
const useGetChairmanTokenMock = vi.hoisted(() => vi.fn());

vi.mock('../../../hooks/sockets/useChairmanSocket', () => ({
  default: useChairmanSocketMock,
}));

vi.mock('../../../hooks/query/useGetChairmanToken', () => ({
  default: useGetChairmanTokenMock,
}));

vi.mock('../../../apis/sockets/SocketManager', () => ({
  socketManager: {
    isConnected: vi.fn(() => false),
    disconnect: vi.fn(),
  },
}));

function createToken(expiresAtMs: number) {
  const payload = btoa(
    JSON.stringify({ sub: 'a', exp: Math.floor(expiresAtMs / 1000) }),
  );
  return `header.${payload}.signature`;
}

describe('useLiveShare', () => {
  const connect = vi.fn();
  const disconnect = vi.fn();
  const sendDebateEvent = vi.fn();
  const refetch = vi.fn();

  function mockChairmanToken(token: string) {
    useGetChairmanTokenMock.mockReturnValue({
      data: token,
      isPending: false,
      isError: false,
      refetch,
    });
  }

  function mockChairmanSocket(
    overrides: Partial<{ isConnected: boolean; isReplaced: boolean }> = {},
  ) {
    useChairmanSocketMock.mockReturnValue({
      connect,
      disconnect,
      sendDebateEvent,
      isConnected: false,
      isReplaced: false,
      error: null,
      ...overrides,
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockChairmanToken('chairman-token');
    mockChairmanSocket();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('모달을 열면 사회자 토큰으로 소켓 연결을 시작한다', () => {
    const { result } = renderHook(() => useLiveShare(1));

    act(() => {
      result.current.toggleLiveShareModal();
    });

    expect(connect).toHaveBeenCalledTimes(1);
  });

  describe('다른 탭/기기에 밀려났을 때', () => {
    it('공유 모달을 열고 밀려난 오류로 알린다', () => {
      mockChairmanSocket({ isReplaced: true });

      const { result } = renderHook(() => useLiveShare(1));

      expect(result.current.isLiveShareModalOpen).toBe(true);
      expect(result.current.isError).toBe(true);
      expect(result.current.errorType).toBe('replaced');
      expect(result.current.isLoading).toBe(false);
    });

    it('모달이 열려 있어도 자동으로 다시 연결하지 않는다', () => {
      mockChairmanSocket({ isReplaced: true });

      renderHook(() => useLiveShare(1));

      expect(connect).not.toHaveBeenCalled();
    });

    it('다시 공유할 수 있도록 사회자 토큰을 지우는 연결 해제를 하지 않는다', () => {
      mockChairmanSocket({ isReplaced: true });

      renderHook(() => useLiveShare(1));

      expect(disconnect).not.toHaveBeenCalled();
    });

    it('이 화면에서 다시 공유하면 새로 연결한다', () => {
      mockChairmanSocket({ isReplaced: true });
      const { result } = renderHook(() => useLiveShare(1));

      act(() => {
        result.current.restartLiveShare();
      });

      expect(connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('사회자 토큰 갱신', () => {
    const NOW = new Date('2026-09-25T00:00:00Z').getTime();

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(NOW);
    });

    it('공유 중이면 토큰 만료 1분 전에 새 토큰을 요청한다', () => {
      mockChairmanToken(createToken(NOW + 10 * 60 * 1000));
      mockChairmanSocket({ isConnected: true });

      renderHook(() => useLiveShare(1));

      vi.advanceTimersByTime(9 * 60 * 1000 - 1);
      expect(refetch).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(refetch).toHaveBeenCalledTimes(1);
    });

    it('공유 중이 아니면 토큰을 갱신하지 않는다', () => {
      mockChairmanToken(createToken(NOW + 2 * 60 * 1000));

      renderHook(() => useLiveShare(1));
      vi.advanceTimersByTime(10 * 60 * 1000);

      expect(refetch).not.toHaveBeenCalled();
    });

    it('이미 만료된 토큰으로 이벤트를 보내면 새 토큰을 요청하고 이벤트는 그대로 보낸다', () => {
      const expiredToken = createToken(NOW - 1000);
      mockChairmanToken(expiredToken);
      const { result } = renderHook(() => useLiveShare(1));

      act(() => {
        result.current.issueEvent('FINISHED', null);
      });

      expect(refetch).toHaveBeenCalledTimes(1);
      expect(sendDebateEvent).toHaveBeenCalledWith(
        'FINISHED',
        null,
        expiredToken,
      );
    });

    it('유효한 토큰으로 이벤트를 보내면 토큰을 다시 요청하지 않는다', () => {
      mockChairmanToken(createToken(NOW + 10 * 60 * 1000));
      const { result } = renderHook(() => useLiveShare(1));

      act(() => {
        result.current.issueEvent('FINISHED', null);
      });

      expect(refetch).not.toHaveBeenCalled();
    });
  });
});
