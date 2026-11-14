// 다기기 녹음 V2의 세션·기기 토큰을 새로고침과 종료 화면 이동을 견디도록 탭의 sessionStorage에 둔다.
// 참가 코드·기기 토큰은 서버에서 다시 조회할 수 없다.

export interface HostRecordingV2 {
  sessionKey: string;
  joinCode: string;
  deviceToken: string;
}

const hostKey = (tableId: number) => `RecordingV2Host:${tableId}`;
const audienceKey = (sessionKey: string) => `RecordingV2Audience:${sessionKey}`;

export function saveHostRecordingV2(tableId: number, host: HostRecordingV2) {
  write(hostKey(tableId), JSON.stringify(host));
}

export function getHostRecordingV2(tableId: number): HostRecordingV2 | null {
  try {
    const raw = sessionStorage.getItem(hostKey(tableId));
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

export function updateHostDeviceTokenV2(tableId: number, deviceToken: string) {
  const host = getHostRecordingV2(tableId);
  if (host) {
    saveHostRecordingV2(tableId, { ...host, deviceToken });
  }
}

export function clearHostRecordingV2(tableId: number) {
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
  try {
    return sessionStorage.getItem(audienceKey(sessionKey));
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* 저장소 차단 시 이번 화면에서만 쓴다. */
  }
}
