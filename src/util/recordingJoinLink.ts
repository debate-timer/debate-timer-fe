// 다기기 녹음 V2에서 청중 기기가 같은 녹음 세션에 참가하고 같은 구간을 같은 턴으로 올리기 위한 값.

export interface RecordingJoin {
  sessionKey: string;
  joinCode: string;
}

const SESSION_PARAM = 'rec';
const JOIN_CODE_PARAM = 'code';

// 참가 코드는 서버로 보내지 않는 hash에 넣어 접근 로그·Referer에 남지 않게 한다.
export function appendRecordingJoin(url: string, join: RecordingJoin): string {
  const params = new URLSearchParams({
    [SESSION_PARAM]: join.sessionKey,
    [JOIN_CODE_PARAM]: join.joinCode,
  });
  return `${url.split('#')[0]}#${params.toString()}`;
}

export function parseRecordingJoin(hash: string): RecordingJoin | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const sessionKey = params.get(SESSION_PARAM);
  const joinCode = params.get(JOIN_CODE_PARAM);
  if (!sessionKey || !joinCode) {
    return null;
  }
  return { sessionKey, joinCode };
}

// 모든 기기가 공유 이벤트로 똑같이 만들 수 있도록 구간을 시작한 이벤트의 version을 쓴다.
export function createTurnKey(timeBoxIndex: number, version: number): string {
  return `${timeBoxIndex}-${version}`;
}
