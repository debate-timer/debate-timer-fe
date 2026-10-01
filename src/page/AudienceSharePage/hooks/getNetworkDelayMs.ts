/**
 * 네트워크 지연으로 보정할 수 있는 최대 시간 (ms)
 * - 이보다 큰 값은 실제 지연보다 서버와 기기의 시계 차이일 가능성이 커서 보정하지 않는다
 */
export const MAX_NETWORK_DELAY_MS = 1000;

/**
 * 서버가 메시지를 중계한 시각부터 청중이 받은 시각까지 흐른 시간(ms)을 계산합니다.
 * 기기 시계가 서버와 어긋나 값이 음수이거나 지나치게 크면 보정하지 않도록 0을 반환합니다.
 */
export function getNetworkDelayMs(
  serverTime: number | null | undefined,
  receivedAt: number,
): number {
  if (serverTime === undefined || serverTime === null) {
    return 0;
  }

  const delay = receivedAt - serverTime;
  if (delay < 0 || delay > MAX_NETWORK_DELAY_MS) {
    return 0;
  }

  return delay;
}
