import { SocketErrorCode } from '../../apis/sockets/error';

export type AudienceShareErrorCode =
  | SocketErrorCode
  | 'EVENT_TIMEOUT'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

export class AudienceShareError extends Error {
  public readonly code: AudienceShareErrorCode;
  public readonly technicalError: Error | null;

  constructor(
    code: AudienceShareErrorCode,
    technicalError: Error | null = null,
  ) {
    super(code);
    this.name = 'AudienceShareError';
    this.code = code;
    this.technicalError = technicalError;
  }
}
