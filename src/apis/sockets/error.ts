export type SocketErrorCode =
  | 'SOCKET_URL_UNAVAILABLE'
  | 'SOCKET_SERVER_REJECTED'
  | 'SOCKET_STOMP_ERROR'
  | 'SOCKET_RETRY_EXHAUSTED';

export class SocketError extends Error {
  public readonly code: SocketErrorCode;
  public readonly detail?: unknown;

  constructor(code: SocketErrorCode, message: string, detail?: unknown) {
    super(message);
    this.name = 'SocketError';
    this.code = code;
    this.detail = detail;
  }
}

export function isSocketError(error: unknown): error is SocketError {
  return error instanceof SocketError;
}
