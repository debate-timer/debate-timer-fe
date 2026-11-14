// 다기기 녹음 V2의 세션·기기 토큰을 새로고침과 종료 화면 이동을 견디도록 탭의 sessionStorage에 둔다.
// 참가 코드·기기 토큰은 서버에서 다시 조회할 수 없다.
// 저장소가 막혀 쓰지 못하면 녹음·업로드·종료 결과가 같은 세션을 찾도록 메모리에 대신 둔다(새로고침하면 사라짐).

export interface HostRecordingV2 {
  sessionKey: string;
  joinCode: string;
  deviceToken: string;
}

const hostKey = (tableId: number) => `RecordingV2Host:${tableId}`;
const audienceKey = (sessionKey: string) => `RecordingV2Audience:${sessionKey}`;

const memory = new Map<string, string>();

export function saveHostRecordingV2(tableId: number, host: HostRecordingV2) {
  write(hostKey(tableId), JSON.stringify(host));
}

export function getHostRecordingV2(tableId: number): HostRecordingV2 | null {
  try {
    const raw = read(hostKey(tableId));
    const saved = raw ? (JSON.parse(raw) as Partial<HostRecordingV2>) : null;
    if (
      typeof saved?.sessionKey !== 'string' ||
      typeof saved.joinCode !== 'string' ||
      typeof saved.deviceToken !== 'string'
    ) {
      return null;
    }
    return {
      sessionKey: saved.sessionKey,
      joinCode: saved.joinCode,
      deviceToken: saved.deviceToken,
    };
  } catch {
    return null;
  }
}

// 토큰을 다시 받는 사이 이 탭의 세션이 바뀌었으면, 지금 세션 기록을 이전 세션 토큰으로 덮지 않는다.
export function updateHostDeviceTokenV2(
  tableId: number,
  sessionKey: string,
  deviceToken: string,
) {
  const host = getHostRecordingV2(tableId);
  if (host?.sessionKey === sessionKey) {
    saveHostRecordingV2(tableId, { ...host, deviceToken });
  }
}

export function clearHostRecordingV2(tableId: number) {
  memory.delete(hostKey(tableId));
  try {
    sessionStorage.removeItem(hostKey(tableId));
  } catch {
    /* 저장소 차단 시 지울 값도 없음. */
  }
}

export function saveAudienceDeviceTokenV2(
  sessionKey: string,
  deviceToken: string,
) {
  write(audienceKey(sessionKey), deviceToken);
}

export function getAudienceDeviceTokenV2(sessionKey: string): string | null {
  return read(audienceKey(sessionKey));
}

function read(key: string): string | null {
  try {
    const saved = sessionStorage.getItem(key);
    if (saved !== null) {
      return saved;
    }
  } catch {
    /* 저장소 차단 시 메모리에 둔 값을 쓴다. */
  }
  return memory.get(key) ?? null;
}

function write(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
    memory.delete(key);
  } catch {
    memory.set(key, value);
  }
}
