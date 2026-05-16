import { act, renderHook } from '@testing-library/react';
import type { IMessage } from '@stomp/stompjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SocketMessage } from '../../apis/sockets/type';
import useAudienceSocket from './useAudienceSocket';

const useSocketMock = vi.hoisted(() => vi.fn());

vi.mock('./useSocket', () => ({
  default: useSocketMock,
}));

describe('useAudienceSocket', () => {
  const connect = vi.fn();
  const disconnect = vi.fn();
  const subscribe = vi.fn();
  const unsubscribe = vi.fn();
  const addConnectionListener = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    addConnectionListener.mockImplementation(() => vi.fn());
    useSocketMock.mockReturnValue({
      connect,
      disconnect,
      subscribe,
      unsubscribe,
      addConnectionListener,
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('마운트 시 roomId 기반 채널을 구독해야 한다', () => {
    renderHook(() => useAudienceSocket(123));

    expect(subscribe).toHaveBeenCalledWith('/room/123', expect.any(Function));
  });

  it('메시지를 수신하면 messages 상태를 업데이트해야 한다', () => {
    const message: SocketMessage = {
      eventType: 'FINISHED',
      data: null,
    };
    let handleMessage: (message: IMessage) => void = () => undefined;
    subscribe.mockImplementation(
      (_destination: string, callback: (message: IMessage) => void) => {
        handleMessage = callback;
      },
    );

    const { result } = renderHook(() => useAudienceSocket(123));

    act(() => {
      handleMessage({ body: JSON.stringify(message) } as IMessage);
    });

    expect(result.current.messages).toEqual([message]);
  });

  it('connect 호출 전에 기존 messages 상태를 초기화해야 한다', () => {
    const message: SocketMessage = {
      eventType: 'FINISHED',
      data: null,
    };
    const options = { baseUrl: 'https://api.example.com' };
    let handleMessage: (message: IMessage) => void = () => undefined;
    subscribe.mockImplementation(
      (_destination: string, callback: (message: IMessage) => void) => {
        handleMessage = callback;
      },
    );

    const { result } = renderHook(() => useAudienceSocket(123));

    act(() => {
      handleMessage({ body: JSON.stringify(message) } as IMessage);
    });

    act(() => {
      result.current.connect(options);
    });

    expect(result.current.messages).toEqual([]);
    expect(connect).toHaveBeenCalledWith(options);
  });

  it('disconnect 호출 시 messages 상태를 초기화해야 한다', () => {
    const message: SocketMessage = {
      eventType: 'FINISHED',
      data: null,
    };
    let handleMessage: (message: IMessage) => void = () => undefined;
    subscribe.mockImplementation(
      (_destination: string, callback: (message: IMessage) => void) => {
        handleMessage = callback;
      },
    );

    const { result } = renderHook(() => useAudienceSocket(123));

    act(() => {
      handleMessage({ body: JSON.stringify(message) } as IMessage);
    });

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.messages).toEqual([]);
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('roomId가 변경되면 기존 messages 상태를 초기화해야 한다', () => {
    const message: SocketMessage = {
      eventType: 'FINISHED',
      data: null,
    };
    const callbacks = new Map<string, (message: IMessage) => void>();
    subscribe.mockImplementation(
      (destination: string, callback: (message: IMessage) => void) => {
        callbacks.set(destination, callback);
      },
    );

    const { result, rerender } = renderHook(
      ({ roomId }) => useAudienceSocket(roomId),
      { initialProps: { roomId: 123 } },
    );

    act(() => {
      callbacks.get('/room/123')?.({
        body: JSON.stringify(message),
      } as IMessage);
    });

    act(() => {
      rerender({ roomId: 456 });
    });

    expect(result.current.messages).toEqual([]);
    expect(unsubscribe).toHaveBeenCalledWith('/room/123');
    expect(subscribe).toHaveBeenCalledWith('/room/456', expect.any(Function));
  });

  it('소켓 재연결 이벤트가 발생하면 messages 상태를 초기화해야 한다', () => {
    const message: SocketMessage = {
      eventType: 'FINISHED',
      data: null,
    };
    let handleMessage: (message: IMessage) => void = () => undefined;
    let handleConnection: () => void = () => undefined;
    addConnectionListener.mockImplementation((listener: () => void) => {
      handleConnection = listener;
      return vi.fn();
    });
    subscribe.mockImplementation(
      (_destination: string, callback: (message: IMessage) => void) => {
        handleMessage = callback;
      },
    );

    const { result } = renderHook(() => useAudienceSocket(123));

    act(() => {
      handleMessage({ body: JSON.stringify(message) } as IMessage);
    });

    act(() => {
      handleConnection();
    });

    expect(result.current.messages).toEqual([]);
  });

  it('error가 발생하면 alert를 호출하고 소켓 연결을 해제해야 한다', () => {
    const error = new Error('socket failure');
    useSocketMock.mockReturnValue({
      connect,
      disconnect,
      subscribe,
      unsubscribe,
      addConnectionListener,
      error,
    });

    renderHook(() => useAudienceSocket(123));

    expect(window.alert).toHaveBeenCalledWith('socket failure');
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
