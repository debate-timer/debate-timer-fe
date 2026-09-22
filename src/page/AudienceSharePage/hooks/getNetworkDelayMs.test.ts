import { getNetworkDelayMs, MAX_NETWORK_DELAY_MS } from './getNetworkDelayMs';

describe('getNetworkDelayMs', () => {
  const RECEIVED_AT = 1_790_000_000_000;

  it('서버 중계 시각부터 수신 시각까지 흐른 시간을 반환한다', () => {
    expect(getNetworkDelayMs(RECEIVED_AT - 150, RECEIVED_AT)).toBe(150);
  });

  it('최대 보정값과 같은 지연은 그대로 반환한다', () => {
    expect(
      getNetworkDelayMs(RECEIVED_AT - MAX_NETWORK_DELAY_MS, RECEIVED_AT),
    ).toBe(MAX_NETWORK_DELAY_MS);
  });

  it('서버 중계 시각이 없으면 보정하지 않는다', () => {
    expect(getNetworkDelayMs(undefined, RECEIVED_AT)).toBe(0);
    expect(getNetworkDelayMs(null, RECEIVED_AT)).toBe(0);
  });

  it('서버 시각이 수신 시각보다 늦으면 기기 시계가 어긋난 것으로 보고 보정하지 않는다', () => {
    expect(getNetworkDelayMs(RECEIVED_AT + 300, RECEIVED_AT)).toBe(0);
  });

  it('지연이 최대 보정값을 넘으면 기기 시계가 어긋난 것으로 보고 보정하지 않는다', () => {
    expect(
      getNetworkDelayMs(RECEIVED_AT - MAX_NETWORK_DELAY_MS - 1, RECEIVED_AT),
    ).toBe(0);
  });
});
