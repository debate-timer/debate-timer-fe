import { act, renderHook } from '@testing-library/react';
import type { StompSubscription } from '@stomp/stompjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useSocket from './useSocket';

const socketManagerMock = vi.hoisted(() => ({
  connect: vi.fn(),
  disconnect: vi.fn(),
  publish: vi.fn(),
  subscribe: vi.fn(),
  isConnected: vi.fn(),
  onConnectEvent: vi.fn(),
  offConnectEvent: vi.fn(),
  onCloseEvent: vi.fn(),
  offCloseEvent: vi.fn(),
}));

vi.mock('../../apis/sockets/SocketManager', () => ({
  socketManager: socketManagerMock,
}));

function createSubscription(): StompSubscription {
  return {
    id: 'subscription-id',
    unsubscribe: vi.fn(),
  };
}

function getConnectListener() {
  return socketManagerMock.onConnectEvent.mock.calls[0][0] as () => void;
}

function getCloseListener() {
  return socketManagerMock.onCloseEvent.mock.calls[0][0] as () => void;
}

describe('useSocket', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    socketManagerMock.isConnected.mockReturnValue(false);
    socketManagerMock.subscribe.mockImplementation(() => createSubscription());
  });

  it('connect와 disconnect 호출을 SocketManager에 위임해야 한다', () => {
    const { result } = renderHook(() => useSocket());

    act(() => {
      result.current.connect({ baseUrl: 'https://example.com' });
      result.current.disconnect();
    });

    expect(socketManagerMock.connect).toHaveBeenCalledWith({
      baseUrl: 'https://example.com',
    });
    expect(socketManagerMock.disconnect).toHaveBeenCalledOnce();
  });

  it('subscribe와 unsubscribe가 구독 정보를 등록하고 정리해야 한다', () => {
    const subscription = createSubscription();
    const callback = vi.fn();
    socketManagerMock.isConnected.mockReturnValue(true);
    socketManagerMock.subscribe.mockReturnValue(subscription);

    const { result } = renderHook(() => useSocket());

    act(() => {
      result.current.subscribe('/topic/test', callback);
    });

    expect(socketManagerMock.subscribe).toHaveBeenCalledWith(
      '/topic/test',
      callback,
    );

    act(() => {
      result.current.unsubscribe('/topic/test');
    });

    expect(subscription.unsubscribe).toHaveBeenCalledOnce();
  });

  it('언마운트 시 활성화된 모든 구독을 해제해야 한다', () => {
    const firstSubscription = createSubscription();
    const secondSubscription = createSubscription();
    socketManagerMock.isConnected.mockReturnValue(true);
    socketManagerMock.subscribe
      .mockReturnValueOnce(firstSubscription)
      .mockReturnValueOnce(secondSubscription);

    const { result, unmount } = renderHook(() => useSocket());

    act(() => {
      result.current.subscribe('/topic/first', vi.fn());
      result.current.subscribe('/topic/second', vi.fn());
    });

    unmount();

    expect(firstSubscription.unsubscribe).toHaveBeenCalledOnce();
    expect(secondSubscription.unsubscribe).toHaveBeenCalledOnce();
    expect(socketManagerMock.offConnectEvent).toHaveBeenCalledWith(
      getConnectListener(),
    );
    expect(socketManagerMock.offCloseEvent).toHaveBeenCalledWith(
      getCloseListener(),
    );
  });

  it('소켓 종료 이벤트가 발생하면 연결 상태를 false로 갱신해야 한다', () => {
    socketManagerMock.isConnected.mockReturnValue(true);

    const { result } = renderHook(() => useSocket());

    expect(result.current.isConnected).toBe(true);

    act(() => {
      getCloseListener()();
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('재연결 이벤트가 발생하면 백업된 구독을 다시 등록해야 한다', () => {
    const callback = vi.fn();
    const subscription = createSubscription();
    socketManagerMock.subscribe.mockReturnValue(subscription);

    const { result } = renderHook(() => useSocket());

    act(() => {
      result.current.subscribe('/topic/recover', callback);
    });

    socketManagerMock.subscribe.mockClear();

    act(() => {
      getConnectListener()();
    });

    expect(socketManagerMock.subscribe).toHaveBeenCalledWith(
      '/topic/recover',
      callback,
    );
  });

  it('연결 이벤트가 발생하면 등록한 연결 리스너를 구독 복구 전에 호출해야 한다', () => {
    const connectionListener = vi.fn();
    const recoverCallback = vi.fn();
    const subscription = createSubscription();
    socketManagerMock.subscribe.mockReturnValue(subscription);

    const listenerHook = renderHook(() => useSocket());

    act(() => {
      listenerHook.result.current.addConnectionListener(connectionListener);
      listenerHook.result.current.subscribe('/topic/recover', recoverCallback);
    });

    socketManagerMock.subscribe.mockClear();

    act(() => {
      getConnectListener()();
    });

    expect(connectionListener).toHaveBeenCalledOnce();
    expect(socketManagerMock.subscribe).toHaveBeenCalledWith(
      '/topic/recover',
      recoverCallback,
    );
    expect(connectionListener.mock.invocationCallOrder[0]).toBeLessThan(
      socketManagerMock.subscribe.mock.invocationCallOrder[0],
    );

    listenerHook.unmount();
  });

  it('재연결 구독 복구가 재시도 후에도 실패하면 error 상태를 설정해야 한다', async () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    socketManagerMock.subscribe.mockReturnValue(null);

    const { result } = renderHook(() => useSocket());

    act(() => {
      result.current.subscribe('/topic/failure', callback);
    });

    act(() => {
      getConnectListener()();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });
});
