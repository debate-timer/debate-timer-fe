import { AudienceShareError } from './error';
import { SocketError } from '../../apis/sockets/error';

describe('AudienceShareError', () => {
  it('should initialize with correct code and name', () => {
    const error = new AudienceShareError('EVENT_TIMEOUT');
    expect(error.name).toBe('AudienceShareError');
    expect(error.code).toBe('EVENT_TIMEOUT');
    expect(error.technicalError).toBeNull();
  });

  it('should keep original technicalError', () => {
    const technical = new Error('Some technical details');
    const error = new AudienceShareError('SERVER_ERROR', technical);
    expect(error.code).toBe('SERVER_ERROR');
    expect(error.technicalError).toBe(technical);
  });

  it('can store socket errors', () => {
    const socketError = new SocketError('SOCKET_STOMP_ERROR', 'Stomp failed');
    const error = new AudienceShareError('SOCKET_STOMP_ERROR', socketError);
    expect(error.code).toBe('SOCKET_STOMP_ERROR');
    expect(error.technicalError).toBe(socketError);
  });
});
