import { TimeBasedStance } from '../types/type';
import { SpeechSegment } from '../types/transcript';

// 토론 기록 초안은 타이머 화면에서 쌓고, 종료 화면에서 서버로 보낸다.
// 화면 이동과 새로고침을 견디도록 테이블별 sessionStorage에 둔다.
const DRAFT_KEY_PREFIX = 'TranscriptDraft:';
const SUBMITTED_KEY_PREFIX = 'TranscriptSubmitted:';

export interface DraftSegment extends SpeechSegment {
  id: string;
}

export interface TranscriptDraft {
  startedAt: number;
  segments: DraftSegment[];
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
    return JSON.parse(raw) as TranscriptDraft;
  } catch {
    return null;
  }
}

function saveDraft(tableId: number, draft: TranscriptDraft) {
  sessionStorage.setItem(draftKey(tableId), JSON.stringify(draft));
}

export function startTranscriptDraft(tableId: number, startedAt: number) {
  saveDraft(tableId, { startedAt, segments: [] });
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

export function hasTranscriptDraft(tableId: number): boolean {
  const draft = getTranscriptDraft(tableId);
  return !!draft && draft.segments.some(({ utterances }) => utterances.length);
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
