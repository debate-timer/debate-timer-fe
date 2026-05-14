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

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    useSocketMock.mockReturnValue({
      connect,
      disconnect,
      subscribe,
      unsubscribe,
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

  it('error가 발생하면 alert를 호출하고 소켓 연결을 해제해야 한다', () => {
    const error = new Error('socket failure');
    useSocketMock.mockReturnValue({
      connect,
      disconnect,
      subscribe,
      unsubscribe,
      error,
    });

    renderHook(() => useAudienceSocket(123));

    expect(window.alert).toHaveBeenCalledWith('socket failure');
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
