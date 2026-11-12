import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { socketManager } from '../../../apis/sockets/SocketManager';
import { SocketError } from '../../../apis/sockets/error';
import useLiveShareSession from './useLiveShareSession';

const REFETCH = vi.hoisted(() => vi.fn());
vi.mock('../../../hooks/query/useGetChairmanToken', () => ({
  chairmanTokenQueryKey: (tableId: string) => ['chairmanToken', tableId],
  default: () => ({
    data: 'token',
    isPending: false,
    isError: false,
    refetch: REFETCH,
  }),
}));
vi.mock('../../../apis/sockets/SocketManager', () => {
  const errors = new Set<(error: SocketError) => void>();
  return {
    socketManager: {
      isConnected: () => false,
      connect: vi.fn(() => {
        if (errors.size === 0) {
          return;
        }
        queueMicrotask(() =>
          errors.forEach((listener) =>
            listener(new SocketError('SOCKET_STOMP_ERROR', '연결 실패')),
          ),
        );
      }),
      disconnect: vi.fn(),
      publish: () => false,
      subscribe: () => ({ id: 'subscription', unsubscribe: vi.fn() }),
      onConnectEvent: vi.fn(),
      offConnectEvent: vi.fn(),
      onCloseEvent: vi.fn(),
      offCloseEvent: vi.fn(),
      onErrorEvent: (listener: (error: SocketError) => void) =>
        errors.add(listener),
      offErrorEvent: (listener: (error: SocketError) => void) =>
        errors.delete(listener),
    },
  };
});

describe('공유 수명과 실제 역할 소켓 조립', () => {
  it('연결 실패를 보존하고 사용자 재시작 전에는 자동으로 다시 연결하지 않는다', async () => {
    vi.clearAllMocks();
    const { result } = renderHook(() => useLiveShareSession(1), {
      wrapper: ({ children }) =>
        createElement(
          QueryClientProvider,
          { client: new QueryClient() },
          children,
        ),
    });
    act(() => result.current.startSharing());
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(socketManager.connect).toHaveBeenCalledTimes(1);
    act(() => result.current.restartLiveShare());
    await waitFor(() => expect(socketManager.connect).toHaveBeenCalledTimes(2));
  });
});
