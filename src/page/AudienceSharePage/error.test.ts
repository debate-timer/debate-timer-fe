import { AudienceShareError } from './error';
import { SocketError } from '../../apis/sockets/error';

describe('AudienceShareError 오류 객체', () => {
  it('올바른 코드와 이름으로 초기화된다', () => {
    const error = new AudienceShareError('EVENT_TIMEOUT');
    expect(error.name).toBe('AudienceShareError');
    expect(error.code).toBe('EVENT_TIMEOUT');
    expect(error.technicalError).toBeNull();
  });

  it('원본 technicalError를 유지한다', () => {
    const technical = new Error('Some technical details');
    const error = new AudienceShareError('SERVER_ERROR', technical);
    expect(error.code).toBe('SERVER_ERROR');
    expect(error.technicalError).toBe(technical);
  });

  it('소켓 오류를 저장할 수 있다', () => {
    const socketError = new SocketError('SOCKET_STOMP_ERROR', 'Stomp failed');
    const error = new AudienceShareError('SOCKET_STOMP_ERROR', socketError);
    expect(error.code).toBe('SOCKET_STOMP_ERROR');
    expect(error.technicalError).toBe(socketError);
  });
});
