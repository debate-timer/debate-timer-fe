// 대시보드 토론 기록 탭의 새 기록(N) 표시 여부를 판단한다.
// 사용자 기기 시계 대신 서버가 준 생성 시각을 기준으로, 마지막으로 본 가장 최근 기록 시각을 저장한다.
const SEEN_AT_KEY = 'TranscriptListSeenAt';
// 기록이 하나도 없을 때 탭을 열었음을 나타내는 가장 이른 시각
const EMPTY_SEEN_AT = '1970-01-01T00:00:00';

interface CreatedAtHolder {
  createdAt: string;
}

export function getTranscriptListSeenAt(): string | null {
  try {
    return localStorage.getItem(SEEN_AT_KEY);
  } catch {
    return null;
  }
}

export function markTranscriptListSeen(transcripts: CreatedAtHolder[]) {
  const latest = transcripts.reduce<string>(
    (max, { createdAt }) =>
      Date.parse(createdAt) > Date.parse(max) ? createdAt : max,
    EMPTY_SEEN_AT,
  );
  try {
    localStorage.setItem(SEEN_AT_KEY, latest);
  } catch {
    // 저장하지 못하면 다음 방문에도 새 기록으로 표시될 뿐이다.
  }
}

// 탭을 한 번도 열지 않았거나, 마지막으로 본 뒤에 만들어진 기록이 있으면 true
export function hasUnseenTranscripts(
  transcripts: CreatedAtHolder[],
  seenAt: string | null,
): boolean {
  if (seenAt === null) {
    return true;
  }
  const seenTime = Date.parse(seenAt);
  return transcripts.some(({ createdAt }) => Date.parse(createdAt) > seenTime);
}
