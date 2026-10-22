import { TimeBasedStance } from '../types/type';
import { SpeechSegment, SttMode, Utterance } from '../types/transcript';

// 토론 기록 초안은 타이머 화면에서 쌓고, 종료 화면에서 서버로 보낸다.
// 화면 이동과 새로고침을 견디도록 테이블별 sessionStorage에 둔다.
const DRAFT_KEY_PREFIX = 'TranscriptDraft:';
const SUBMITTED_KEY_PREFIX = 'TranscriptSubmitted:';
// 서버 전사 제한 시간(3분)에 여유를 둔 값. 지나도 응답이 없으면 새로고침 등으로 요청이 끊긴 것으로 본다.
export const PENDING_SEGMENT_TIMEOUT_MS = 4 * 60 * 1000;

export interface DraftSegment extends SpeechSegment {
  id: string;
}

export interface PendingSegment {
  id: string;
  requestedAt: number;
}

export interface TranscriptDraft {
  startedAt: number;
  sttMode: SttMode;
  segments: DraftSegment[];
  // Soniox 모드에서 서버 전사를 기다리는 구간
  pendingSegments: PendingSegment[];
  failedSegmentCount: number;
}

export interface SegmentKey {
  id: string;
  timeBoxIndex: number;
  team: TimeBasedStance | null;
}

const draftKey = (tableId: number) => `${DRAFT_KEY_PREFIX}${tableId}`;
const submittedKey = (tableId: number) => `${SUBMITTED_KEY_PREFIX}${tableId}`;

export function getTranscriptDraft(tableId: number): TranscriptDraft | null {
  const raw = sessionStorage.getItem(draftKey(tableId));
  if (!raw) {
    return null;
  }
  try {
    const draft = JSON.parse(raw) as Partial<TranscriptDraft>;
    // STT 모드 선택 이전에 만든 초안은 크롬 음성 인식 기록이다.
    return {
      startedAt: draft.startedAt ?? 0,
      sttMode: draft.sttMode ?? 'RPC',
      segments: draft.segments ?? [],
      pendingSegments: draft.pendingSegments ?? [],
      failedSegmentCount: draft.failedSegmentCount ?? 0,
    };
  } catch {
    return null;
  }
}

function saveDraft(tableId: number, draft: TranscriptDraft) {
  sessionStorage.setItem(draftKey(tableId), JSON.stringify(draft));
}

export function startTranscriptDraft(
  tableId: number,
  startedAt: number,
  sttMode: SttMode = 'RPC',
) {
  saveDraft(tableId, {
    startedAt,
    sttMode,
    segments: [],
    pendingSegments: [],
    failedSegmentCount: 0,
  });
  sessionStorage.removeItem(submittedKey(tableId));
}

export function appendUtterance(
  tableId: number,
  segmentKey: SegmentKey,
  text: string,
  recognizedAt: number,
) {
  const draft = getTranscriptDraft(tableId);
  const trimmed = text.trim();
  if (!draft || trimmed === '') {
    return;
  }

  const utterance = {
    offsetMs: Math.max(0, recognizedAt - draft.startedAt),
    text: trimmed,
  };
  const segment = draft.segments.find(({ id }) => id === segmentKey.id);
  if (segment) {
    segment.utterances.push(utterance);
  } else {
    draft.segments.push({ ...segmentKey, utterances: [utterance] });
  }
  saveDraft(tableId, draft);
}

export function markSegmentPending(
  tableId: number,
  segmentId: string,
  requestedAt: number,
) {
  const draft = getTranscriptDraft(tableId);
  if (!draft) {
    return;
  }
  draft.pendingSegments.push({ id: segmentId, requestedAt });
  saveDraft(tableId, draft);
}

/**
 * 서버가 전사한 한 구간의 문장을 저장하고 전사 대기에서 뺀다.
 * 문장 시각은 구간 오디오 기준이라 구간 녹음 시작 시각을 더해 기록 시작 기준으로 바꾼다.
 */
export function appendSegmentUtterances(
  tableId: number,
  segmentKey: SegmentKey,
  segmentStartedAt: number,
  utterances: Utterance[],
) {
  const draft = getTranscriptDraft(tableId);
  if (!draft) {
    return;
  }
  const segmentOffsetMs = segmentStartedAt - draft.startedAt;
  const converted = utterances
    .map(({ offsetMs, text }) => ({
      offsetMs: Math.max(0, segmentOffsetMs + offsetMs),
      text: text.trim(),
    }))
    .filter(({ text }) => text !== '');
  if (converted.length > 0) {
    draft.segments.push({ ...segmentKey, utterances: converted });
  }
  draft.pendingSegments = draft.pendingSegments.filter(
    ({ id }) => id !== segmentKey.id,
  );
  saveDraft(tableId, draft);
}

export function failPendingSegment(tableId: number, segmentId: string) {
  const draft = getTranscriptDraft(tableId);
  if (!draft) {
    return;
  }
  draft.pendingSegments = draft.pendingSegments.filter(
    ({ id }) => id !== segmentId,
  );
  draft.failedSegmentCount += 1;
  saveDraft(tableId, draft);
}

export function countPendingSegments(
  draft: TranscriptDraft,
  now: number,
): number {
  return draft.pendingSegments.filter(
    ({ requestedAt }) => now - requestedAt < PENDING_SEGMENT_TIMEOUT_MS,
  ).length;
}

// 보낼 문장이 있거나, 아직 전사 중이라 곧 문장이 생길 구간이 있으면 초안이 있는 것으로 본다.
export function hasTranscriptDraft(
  tableId: number,
  now: number = Date.now(),
): boolean {
  const draft = getTranscriptDraft(tableId);
  if (!draft) {
    return false;
  }
  return (
    draft.segments.some(({ utterances }) => utterances.length) ||
    countPendingSegments(draft, now) > 0
  );
}

// 서버 요청 형식으로 바꾼다. 구간 ID는 화면에서만 쓰는 값이라 뺀다.
export function toSpeechSegments(draft: TranscriptDraft): SpeechSegment[] {
  return draft.segments.map(({ timeBoxIndex, team, utterances }) => ({
    timeBoxIndex,
    team,
    utterances,
  }));
}

export function clearTranscriptDraft(tableId: number) {
  sessionStorage.removeItem(draftKey(tableId));
}

export function setSubmittedTranscriptId(
  tableId: number,
  transcriptId: number,
) {
  sessionStorage.setItem(submittedKey(tableId), String(transcriptId));
}

export function getSubmittedTranscriptId(tableId: number): number | null {
  const raw = sessionStorage.getItem(submittedKey(tableId));
  const id = raw === null ? NaN : Number(raw);
  return Number.isInteger(id) ? id : null;
}
