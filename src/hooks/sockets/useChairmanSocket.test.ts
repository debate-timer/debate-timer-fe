import { act, renderHook } from '@testing-library/react';
import type { IMessage } from '@stomp/stompjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TimerDataPayload } from '../../apis/sockets/type';
import useChairmanSocket from './useChairmanSocket';

const useSocketMock = vi.hoisted(() => vi.fn());
const removeQueries = vi.hoisted(() => vi.fn());

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    removeQueries,
  }),
}));

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
    expect(removeQueries).toHaveBeenCalledWith({
      queryKey: ['chairmanToken', '123'],
      exact: true,
    });
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
    expect(removeQueries).not.toHaveBeenCalled();
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
    expect(removeQueries).not.toHaveBeenCalled();
  });

  it('sendDebateEvent 호출 시 payload와 Authorization 헤더를 함께 publish해야 한다', () => {
    const payload: TimerDataPayload = {
      timerType: 'NORMAL',
      currentTeam: 'PROS',
      remainingTime: 30,
      sequence: 1,
    };
    const authToken = 'temporary-chairman-token';
    vi.spyOn(Date, 'now').mockReturnValue(1710000000000);

    const { result } = renderHook(() => useChairmanSocket(123));

    act(() => {
      result.current.sendDebateEvent('NEXT', payload, authToken);
    });

    expect(publish).toHaveBeenCalledWith(
      '/app/event/123',
      {
        eventType: 'NEXT',
        data: payload,
        version: 1710000000000,
      },
      { Authorization: authToken },
    );
  });

  it('같은 시각에 연속 발행해도 version은 단조 증가해야 한다', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000);

    const { result } = renderHook(() => useChairmanSocket(123));

    act(() => {
      result.current.sendDebateEvent('FINISHED', null, 'token');
      result.current.sendDebateEvent('FINISHED', null, 'token');
    });

    expect(publish.mock.calls[0][1].version).toBe(1000);
    expect(publish.mock.calls[1][1].version).toBe(1001);
  });

  it('시각이 앞서 있으면 version은 현재 시각을 따른다', () => {
    const dateNow = vi.spyOn(Date, 'now').mockReturnValue(1000);

    const { result } = renderHook(() => useChairmanSocket(123));

    act(() => {
      result.current.sendDebateEvent('FINISHED', null, 'token');
    });
    dateNow.mockReturnValue(5000);
    act(() => {
      result.current.sendDebateEvent('FINISHED', null, 'token');
    });

    expect(publish.mock.calls[1][1].version).toBe(5000);
  });

  it('서버의 상태 공유 신호를 수신하면 onSyncRequest를 호출해야 한다', () => {
    let handleMessage: (message: IMessage) => void = () => undefined;
    subscribe.mockImplementation(
      (_destination: string, callback: (message: IMessage) => void) => {
        handleMessage = callback;
      },
    );
    const onSyncRequest = vi.fn();

    renderHook(() => useChairmanSocket(123, { onSyncRequest }));

    act(() => {
      handleMessage({ body: '' } as IMessage);
    });

    expect(onSyncRequest).toHaveBeenCalledTimes(1);
  });

  it('onSyncRequest가 바뀌어도 재구독 없이 최신 콜백을 호출해야 한다', () => {
    let handleMessage: (message: IMessage) => void = () => undefined;
    subscribe.mockImplementation(
      (_destination: string, callback: (message: IMessage) => void) => {
        handleMessage = callback;
      },
    );
    const firstCallback = vi.fn();
    const latestCallback = vi.fn();

    const { rerender } = renderHook(
      ({ onSyncRequest }) => useChairmanSocket(123, { onSyncRequest }),
      { initialProps: { onSyncRequest: firstCallback } },
    );
    rerender({ onSyncRequest: latestCallback });

    act(() => {
      handleMessage({ body: '' } as IMessage);
    });

    expect(subscribe).toHaveBeenCalledTimes(1);
    expect(firstCallback).not.toHaveBeenCalled();
    expect(latestCallback).toHaveBeenCalledTimes(1);
  });
});
