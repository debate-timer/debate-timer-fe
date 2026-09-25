import { act, renderHook } from '@testing-library/react';
import type { IMessage } from '@stomp/stompjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TimerDataPayload } from '../../apis/sockets/type';
import { socketManager } from '../../apis/sockets/SocketManager';
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
    expect(connect).toHaveBeenCalledWith(expect.objectContaining(options));
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
      {
        Authorization: authToken,
        'X-Chairman-Session': expect.any(String),
      },
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

  it('소켓이 연결(재연결 포함)되면 채널 재구독이 끝난 뒤 onSyncRequest를 호출해 현재 상태를 먼저 공유해야 한다', async () => {
    const connectionListeners: Array<() => void> = [];
    addConnectionListener.mockImplementation((listener: () => void) => {
      connectionListeners.push(listener);
      return vi.fn();
    });
    const onSyncRequest = vi.fn();

    renderHook(() => useChairmanSocket(123, { onSyncRequest }));

    act(() => {
      connectionListeners.forEach((listener) => listener());
    });

    // 연결 리스너 실행 시점(재구독 전)에는 아직 공유하지 않는다
    expect(onSyncRequest).not.toHaveBeenCalled();

    await act(async () => {
      await Promise.resolve();
    });

    expect(onSyncRequest).toHaveBeenCalledTimes(1);
  });

  describe('사회자 세션', () => {
    function captureChairmanChannel() {
      let handleMessage: (message: IMessage) => void = () => undefined;
      let resolveHeaders: () => Record<string, string> = () => ({});
      subscribe.mockImplementation(
        (
          _destination: string,
          callback: (message: IMessage) => void,
          headers: () => Record<string, string>,
        ) => {
          handleMessage = callback;
          resolveHeaders = headers;
        },
      );
      return {
        send: (body: unknown) =>
          handleMessage({ body: JSON.stringify(body) } as IMessage),
        sessionId: () => resolveHeaders()['X-Chairman-Session'],
      };
    }

    it('사회자 채널을 구독할 때 최신 사회자 토큰을 첨부해야 한다', () => {
      let resolveHeaders: () => Record<string, string> = () => ({});
      subscribe.mockImplementation(
        (
          _destination: string,
          _callback: (message: IMessage) => void,
          headers: () => Record<string, string>,
        ) => {
          resolveHeaders = headers;
        },
      );
      let token = 'first-token';

      renderHook(() => useChairmanSocket(123, { getAuthToken: () => token }));

      expect(resolveHeaders().Authorization).toBe('first-token');

      token = 'refreshed-token';
      expect(resolveHeaders().Authorization).toBe('refreshed-token');
    });

    it('사회자 토큰이 없으면 Authorization 헤더를 첨부하지 않아야 한다', () => {
      let resolveHeaders: () => Record<string, string> = () => ({});
      subscribe.mockImplementation(
        (
          _destination: string,
          _callback: (message: IMessage) => void,
          headers: () => Record<string, string>,
        ) => {
          resolveHeaders = headers;
        },
      );

      renderHook(() => useChairmanSocket(123, { getAuthToken: () => null }));

      expect(resolveHeaders()).not.toHaveProperty('Authorization');
    });

    it('사회자 채널 구독과 이벤트 발행에 같은 사회자 세션 식별자를 첨부해야 한다', () => {
      const channel = captureChairmanChannel();

      const { result } = renderHook(() => useChairmanSocket(123));
      act(() => {
        result.current.sendDebateEvent('FINISHED', null, 'token');
      });

      expect(channel.sessionId()).toEqual(expect.any(String));
      expect(publish.mock.calls[0][2]['X-Chairman-Session']).toBe(
        channel.sessionId(),
      );
    });

    it('공유를 새로 시작하면 새 사회자 세션 식별자를 사용해야 한다', () => {
      const channel = captureChairmanChannel();

      const { result } = renderHook(() => useChairmanSocket(123));
      const previousSessionId = channel.sessionId();
      act(() => {
        result.current.connect();
      });

      expect(channel.sessionId()).not.toBe(previousSessionId);
    });

    it('다른 사회자 세션이 활성 사회자가 되면 밀려난 상태로 바꾸고 연결을 끊어야 한다', () => {
      const channel = captureChairmanChannel();
      const onSyncRequest = vi.fn();

      const { result } = renderHook(() =>
        useChairmanSocket(123, { onSyncRequest }),
      );
      act(() => {
        channel.send({
          type: 'REPLACED',
          roomId: 123,
          activeSessionId: 'other',
        });
      });

      expect(result.current.isReplaced).toBe(true);
      expect(disconnect).toHaveBeenCalledTimes(1);
      expect(onSyncRequest).not.toHaveBeenCalled();
    });

    it('자신이 활성 사회자라는 교체 알림은 무시해야 한다', () => {
      const channel = captureChairmanChannel();
      const onSyncRequest = vi.fn();

      const { result } = renderHook(() =>
        useChairmanSocket(123, { onSyncRequest }),
      );
      act(() => {
        channel.send({
          type: 'REPLACED',
          roomId: 123,
          activeSessionId: channel.sessionId(),
        });
      });

      expect(result.current.isReplaced).toBe(false);
      expect(disconnect).not.toHaveBeenCalled();
      expect(onSyncRequest).not.toHaveBeenCalled();
    });

    it('상태 공유 요청 알림을 받으면 onSyncRequest를 호출해야 한다', () => {
      const channel = captureChairmanChannel();
      const onSyncRequest = vi.fn();

      renderHook(() => useChairmanSocket(123, { onSyncRequest }));
      act(() => {
        channel.send({ type: 'SYNC_REQUEST', roomId: 123 });
      });

      expect(onSyncRequest).toHaveBeenCalledTimes(1);
    });

    it('밀려난 뒤 공유를 다시 시작하면 밀려난 상태를 해제해야 한다', () => {
      const channel = captureChairmanChannel();

      const { result } = renderHook(() => useChairmanSocket(123));
      act(() => {
        channel.send({
          type: 'REPLACED',
          roomId: 123,
          activeSessionId: 'other',
        });
      });
      act(() => {
        result.current.connect();
      });

      expect(result.current.isReplaced).toBe(false);
      expect(connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('heartbeat', () => {
    const setConnected = (isConnected: boolean) => {
      useSocketMock.mockReturnValue({
        connect,
        disconnect,
        subscribe,
        unsubscribe,
        publish,
        addConnectionListener,
        isConnected,
        error: null,
      });
    };

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('연결된 동안 5초마다 onSyncRequest를 호출해야 한다', () => {
      setConnected(true);
      const onSyncRequest = vi.fn();

      renderHook(() => useChairmanSocket(123, { onSyncRequest }));

      act(() => {
        vi.advanceTimersByTime(4999);
      });
      expect(onSyncRequest).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(onSyncRequest).toHaveBeenCalledTimes(1);

      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(onSyncRequest).toHaveBeenCalledTimes(3);
    });

    it('연결되지 않은 상태에서는 onSyncRequest를 주기적으로 호출하지 않아야 한다', () => {
      setConnected(false);
      const onSyncRequest = vi.fn();

      renderHook(() => useChairmanSocket(123, { onSyncRequest }));

      act(() => {
        vi.advanceTimersByTime(20000);
      });

      expect(onSyncRequest).not.toHaveBeenCalled();
    });

    it('연결이 끊기면 주기 호출을 멈춰야 한다', () => {
      setConnected(true);
      const onSyncRequest = vi.fn();

      const { rerender } = renderHook(() =>
        useChairmanSocket(123, { onSyncRequest }),
      );

      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(onSyncRequest).toHaveBeenCalledTimes(1);

      setConnected(false);
      rerender();

      act(() => {
        vi.advanceTimersByTime(20000);
      });
      expect(onSyncRequest).toHaveBeenCalledTimes(1);
    });

    it('언마운트되면 주기 호출을 멈춰야 한다', () => {
      setConnected(true);
      const onSyncRequest = vi.fn();

      const { unmount } = renderHook(() =>
        useChairmanSocket(123, { onSyncRequest }),
      );
      unmount();

      act(() => {
        vi.advanceTimersByTime(20000);
      });

      expect(onSyncRequest).not.toHaveBeenCalled();
    });
  });

  it('공유를 시작하면 횟수 제한 없는 재연결 정책으로 연결해야 한다', () => {
    const { result } = renderHook(() => useChairmanSocket(123));

    act(() => {
      result.current.connect();
    });

    expect(connect).toHaveBeenCalledWith(
      expect.objectContaining({ maxRetries: null, maxRetryDelayMs: 30000 }),
    );
  });

  describe('탭 복귀', () => {
    const setConnected = (isConnected: boolean) => {
      useSocketMock.mockReturnValue({
        connect,
        disconnect,
        subscribe,
        unsubscribe,
        publish,
        addConnectionListener,
        isConnected,
        error: null,
      });
    };

    const setVisibilityState = (state: DocumentVisibilityState) => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => state,
      });
    };

    const returnToForeground = () => {
      act(() => {
        setVisibilityState('visible');
        document.dispatchEvent(new Event('visibilitychange'));
      });
    };

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-09-25T10:00:00Z'));
      setVisibilityState('visible');
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('공유를 시작하지 않았으면 복귀해도 아무것도 하지 않아야 한다', () => {
      setConnected(false);
      vi.spyOn(socketManager, 'isConnected').mockReturnValue(false);
      const onSyncRequest = vi.fn();

      renderHook(() => useChairmanSocket(123, { onSyncRequest }));
      returnToForeground();

      expect(connect).not.toHaveBeenCalled();
      expect(onSyncRequest).not.toHaveBeenCalled();
    });

    it('공유 중 연결이 살아 있으면 복귀 시 즉시 상태를 공유해야 한다', () => {
      setConnected(true);
      vi.spyOn(socketManager, 'isConnected').mockReturnValue(true);
      const onSyncRequest = vi.fn();

      const { result } = renderHook(() =>
        useChairmanSocket(123, { onSyncRequest }),
      );
      act(() => {
        result.current.connect();
      });
      onSyncRequest.mockClear();

      returnToForeground();

      expect(onSyncRequest).toHaveBeenCalledTimes(1);
      expect(connect).toHaveBeenCalledTimes(1);
    });

    it('공유 중 연결이 끊겼으면 복귀 시 다시 연결해야 한다', () => {
      setConnected(false);
      vi.spyOn(socketManager, 'isConnected').mockReturnValue(false);
      const onSyncRequest = vi.fn();

      const { result } = renderHook(() =>
        useChairmanSocket(123, { onSyncRequest }),
      );
      act(() => {
        result.current.connect();
      });
      onSyncRequest.mockClear();

      returnToForeground();

      expect(connect).toHaveBeenCalledTimes(2);
      expect(onSyncRequest).not.toHaveBeenCalled();
    });

    it('짧은 간격으로 복귀를 반복해도 한 번만 상태를 공유해야 한다', () => {
      setConnected(true);
      vi.spyOn(socketManager, 'isConnected').mockReturnValue(true);
      const onSyncRequest = vi.fn();

      const { result } = renderHook(() =>
        useChairmanSocket(123, { onSyncRequest }),
      );
      act(() => {
        result.current.connect();
      });
      onSyncRequest.mockClear();

      returnToForeground();
      returnToForeground();

      expect(onSyncRequest).toHaveBeenCalledTimes(1);
    });
  });
});
