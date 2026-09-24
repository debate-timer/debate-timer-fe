import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

describe('useLiveShare', () => {
  const connect = vi.fn();
  const disconnect = vi.fn();
  const sendDebateEvent = vi.fn();

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
    useGetChairmanTokenMock.mockReturnValue({
      data: 'chairman-token',
      isPending: false,
      isError: false,
    });
    mockChairmanSocket();
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
});
