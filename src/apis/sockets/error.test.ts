import { describe, it, expect } from 'vitest';
import { SocketError, isSocketError } from './error';

describe('SocketError 테스트', () => {
  it('SocketError 인스턴스는 지정된 코드와 상세 내용을 가져야 한다', () => {
    const error = new SocketError('SOCKET_URL_UNAVAILABLE', 'Message', {
      foo: 'bar',
    });
    expect(error.code).toBe('SOCKET_URL_UNAVAILABLE');
    expect(error.message).toBe('Message');
    expect(error.detail).toEqual({ foo: 'bar' });
    expect(error.name).toBe('SocketError');
  });

  it('isSocketError는 SocketError 인스턴스에 대해 true를 반환한다', () => {
    const error = new SocketError('SOCKET_STOMP_ERROR', 'Message');
    expect(isSocketError(error)).toBe(true);
  });

  it('isSocketError는 일반 Error 인스턴스에 대해 false를 반환한다', () => {
    const error = new Error('Message');
    expect(isSocketError(error)).toBe(false);
  });
});
