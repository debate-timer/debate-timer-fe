import { act, renderHook } from '@testing-library/react';
import type { IMessage } from '@stomp/stompjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TimerDataPayload } from '../../apis/sockets/type';
import useChairmanSocket from './useChairmanSocket';

const useSocketMock = vi.hoisted(() => vi.fn());

vi.mock('./useSocket', () => ({
  default: useSocketMock,
}));

describe('useChairmanSocket', () => {
  const connect = vi.fn();
  const disconnect = vi.fn();
  const subscribe = vi.fn();
  const unsubscribe = vi.fn();
  const publish = vi.fn();
  const addConnectionListener = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    addConnectionListener.mockImplementation(() => vi.fn());
    useSocketMock.mockReturnValue({
      connect,
      disconnect,
      subscribe,
      unsubscribe,
      publish,
      addConnectionListener,
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('마운트 시 roomId 기반 사회자 채널을 구독해야 한다', () => {
    renderHook(() => useChairmanSocket(123));

    expect(subscribe).toHaveBeenCalledWith(
      '/chairman/123',
      expect.any(Function),
    );
  });

  it('신호를 수신하면 signalCount와 lastSignalTime을 업데이트해야 한다', () => {
    const now = 1710000000000;
    let handleMessage: (message: IMessage) => void = () => undefined;
    vi.spyOn(Date, 'now').mockReturnValue(now);
    subscribe.mockImplementation(
      (_destination: string, callback: (message: IMessage) => void) => {
        handleMessage = callback;
      },
    );

    const { result } = renderHook(() => useChairmanSocket(123));

    act(() => {
      handleMessage({ body: '' } as IMessage);
    });

    expect(result.current.signalCount).toBe(1);
    expect(result.current.lastSignalTime).toBe(now);
  });

  it('connect 호출 전에 signalCount와 lastSignalTime을 초기화해야 한다', () => {
    const now = 1710000000000;
    const options = { baseUrl: 'https://api.example.com' };
    let handleMessage: (message: IMessage) => void = () => undefined;
    vi.spyOn(Date, 'now').mockReturnValue(now);
    subscribe.mockImplementation(
      (_destination: string, callback: (message: IMessage) => void) => {
        handleMessage = callback;
      },
    );

    const { result } = renderHook(() => useChairmanSocket(123));

    act(() => {
      handleMessage({ body: '' } as IMessage);
    });

    act(() => {
      result.current.connect(options);
    });

    expect(result.current.signalCount).toBe(0);
    expect(result.current.lastSignalTime).toBeNull();
    expect(connect).toHaveBeenCalledWith(options);
  });

  it('disconnect 호출 시 signalCount와 lastSignalTime을 초기화해야 한다', () => {
    const now = 1710000000000;
    let handleMessage: (message: IMessage) => void = () => undefined;
    vi.spyOn(Date, 'now').mockReturnValue(now);
    subscribe.mockImplementation(
      (_destination: string, callback: (message: IMessage) => void) => {
        handleMessage = callback;
      },
    );

    const { result } = renderHook(() => useChairmanSocket(123));

    act(() => {
      handleMessage({ body: '' } as IMessage);
    });

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.signalCount).toBe(0);
    expect(result.current.lastSignalTime).toBeNull();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('roomId가 변경되면 signalCount와 lastSignalTime을 초기화해야 한다', () => {
    const now = 1710000000000;
    const callbacks = new Map<string, (message: IMessage) => void>();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    subscribe.mockImplementation(
      (destination: string, callback: (message: IMessage) => void) => {
        callbacks.set(destination, callback);
      },
    );

    const { result, rerender } = renderHook(
      ({ roomId }) => useChairmanSocket(roomId),
      { initialProps: { roomId: 123 } },
    );

    act(() => {
      callbacks.get('/chairman/123')?.({ body: '' } as IMessage);
    });

    act(() => {
      rerender({ roomId: 456 });
    });

    expect(result.current.signalCount).toBe(0);
    expect(result.current.lastSignalTime).toBeNull();
    expect(unsubscribe).toHaveBeenCalledWith('/chairman/123');
    expect(subscribe).toHaveBeenCalledWith(
      '/chairman/456',
      expect.any(Function),
    );
  });

  it('error가 발생하면 signalCount와 lastSignalTime을 초기화해야 한다', () => {
    const now = 1710000000000;
    const error = new Error('socket failure');
    let handleMessage: (message: IMessage) => void = () => undefined;
    vi.spyOn(Date, 'now').mockReturnValue(now);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    subscribe.mockImplementation(
      (_destination: string, callback: (message: IMessage) => void) => {
        handleMessage = callback;
      },
    );

    const { result, rerender } = renderHook(() => useChairmanSocket(123));

    act(() => {
      handleMessage({ body: '' } as IMessage);
    });

    useSocketMock.mockReturnValue({
      connect,
      disconnect,
      subscribe,
      unsubscribe,
      publish,
      addConnectionListener,
      error,
    });

    act(() => {
      rerender();
    });

    expect(result.current.signalCount).toBe(0);
    expect(result.current.lastSignalTime).toBeNull();
  });

  it('소켓 재연결 이벤트가 발생하면 signalCount와 lastSignalTime을 초기화해야 한다', () => {
    const now = 1710000000000;
    let handleMessage: (message: IMessage) => void = () => undefined;
    let handleConnection: () => void = () => undefined;
    vi.spyOn(Date, 'now').mockReturnValue(now);
    addConnectionListener.mockImplementation((listener: () => void) => {
      handleConnection = listener;
      return vi.fn();
    });
    subscribe.mockImplementation(
      (_destination: string, callback: (message: IMessage) => void) => {
        handleMessage = callback;
      },
    );

    const { result } = renderHook(() => useChairmanSocket(123));

    act(() => {
      handleMessage({ body: '' } as IMessage);
    });

    act(() => {
      handleConnection();
    });

    expect(result.current.signalCount).toBe(0);
    expect(result.current.lastSignalTime).toBeNull();
  });

  it('sendDebateEvent 호출 시 payload와 Authorization 헤더를 함께 publish해야 한다', () => {
    const payload: TimerDataPayload = {
      timerType: 'NORMAL',
      currentTeam: 'PROS',
      remainingTime: 30,
      sequence: 1,
    };
    const authToken = 'temporary-chairman-token';

    const { result } = renderHook(() => useChairmanSocket(123));

    act(() => {
      result.current.sendDebateEvent('NEXT', payload, authToken);
    });

    expect(publish).toHaveBeenCalledWith(
      '/app/event/123',
      {
        eventType: 'NEXT',
        data: payload,
      },
      { Authorization: authToken },
    );
  });

  it('error가 발생하면 Toast 대체 console 알림을 호출해야 한다', () => {
    const error = new Error('socket failure');
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    useSocketMock.mockReturnValue({
      connect,
      disconnect,
      subscribe,
      unsubscribe,
      publish,
      addConnectionListener,
      error,
    });

    renderHook(() => useChairmanSocket(123));

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Chairman socket connection failed.',
      error,
    );
  });
});
