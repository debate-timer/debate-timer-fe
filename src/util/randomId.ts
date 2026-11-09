/**
 * 세션처럼 한 번의 흐름을 구분하는 무작위 식별자를 만든다.
 * `crypto.randomUUID`는 보안 컨텍스트(HTTPS)에서만 제공되므로 없으면 시각과 난수로 대신한다.
 * 어느 쪽이든 영문 소문자·숫자·'-'만 쓰므로 서버 경로에 그대로 넣을 수 있다.
 */
export function createRandomId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
