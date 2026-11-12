import { TimeBasedStance } from '../types/type';
import { SpeechSegment, SttMode, Utterance } from '../types/transcript';
import { getAccessToken, getAuthRevision, getMemberId } from './accessToken';
import { createRandomId } from './randomId';

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
  memberId: string | null;
  draftId: string;
  startedAt: number;
  sttMode: SttMode;
  segments: DraftSegment[];
  // Soniox 모드에서 서버 전사를 기다리는 구간
  pendingSegments: PendingSegment[];
  failedSegmentCount: number;
}

/** 비동기 결과가 시작한 계정·초안에만 반영되도록 보존하는 호출 문맥임. */
export interface TranscriptDraftContext {
  tableId: number;
  memberId: string | null;
  draftId: string;
  authRevision: number;
}

function currentMemberId(): string | null {
  return getAccessToken() ? getMemberId() : null;
}

export function isTranscriptDraftCurrent(
  context: TranscriptDraftContext,
): boolean {
  return resolveDraft(context) !== null;
}

export function getTranscriptDraftContext(
  tableId: number,
): TranscriptDraftContext | null {
  const draft = getTranscriptDraft(tableId);
  return draft
    ? {
        tableId,
        memberId: draft.memberId,
        draftId: draft.draftId,
        authRevision: getAuthRevision(),
      }
    : null;
}

/** 숫자 인자는 동기 호출용이며 비동기 작업에는 시작 시 확보한 문맥을 전달함. */
function resolveDraft(target: number | TranscriptDraftContext) {
  const tableId = typeof target === 'number' ? target : target.tableId;
  const draft = getTranscriptDraft(tableId);
  if (
    !draft ||
    (typeof target !== 'number' &&
      (target.draftId !== draft.draftId ||
        target.memberId !== draft.memberId ||
        target.authRevision !== getAuthRevision()))
  ) {
    return null;
  }
  return { tableId, draft };
}

export interface SegmentKey {
  id: string;
  timeBoxIndex: number;
  team: TimeBasedStance | null;
}

const draftKey = (tableId: number) => `${DRAFT_KEY_PREFIX}${tableId}`;
const submittedKey = (tableId: number) => `${SUBMITTED_KEY_PREFIX}${tableId}`;

export function getTranscriptDraft(tableId: number): TranscriptDraft | null {
  try {
    const raw = sessionStorage.getItem(draftKey(tableId));
    if (!raw) {
      return null;
    }
    const draft = JSON.parse(raw) as Partial<TranscriptDraft>;
    if (
      !draft.draftId ||
      !('memberId' in draft) ||
      draft.memberId !== currentMemberId() ||
      !Array.isArray(draft.segments)
    ) {
      return null;
    }
    return {
      memberId: draft.memberId,
      draftId: draft.draftId,
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
  try {
    sessionStorage.setItem(draftKey(tableId), JSON.stringify(draft));
  } catch {
    /* 저장소 차단 시 다른 초안에 쓰지 않음. */
  }
}

export function startTranscriptDraft(
  tableId: number,
  startedAt: number,
  sttMode: SttMode = 'RPC',
) {
  const memberId = currentMemberId();
  const draftId = createRandomId();
  saveDraft(tableId, {
    memberId,
    draftId,
    startedAt,
    sttMode,
    segments: [],
    pendingSegments: [],
    failedSegmentCount: 0,
  });
  sessionStorage.removeItem(submittedKey(tableId));
  return { tableId, memberId, draftId, authRevision: getAuthRevision() };
}

export function appendUtterance(
  target: number | TranscriptDraftContext,
  segmentKey: SegmentKey,
  text: string,
  recognizedAt: number,
) {
  const resolved = resolveDraft(target);
  if (!resolved) {
    return;
  }
  const { tableId, draft } = resolved;
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
  target: number | TranscriptDraftContext,
  segmentId: string,
  requestedAt: number,
) {
  const resolved = resolveDraft(target);
  if (!resolved) {
    return;
  }
  const { tableId, draft } = resolved;
  draft.pendingSegments.push({ id: segmentId, requestedAt });
  saveDraft(tableId, draft);
}

/**
 * 서버가 전사한 한 구간의 문장을 저장하고 전사 대기에서 뺀다.
 * 문장 시각은 구간 오디오 기준이라 구간 녹음 시작 시각을 더해 기록 시작 기준으로 바꾼다.
 */
export function appendSegmentUtterances(
  target: number | TranscriptDraftContext,
  segmentKey: SegmentKey,
  segmentStartedAt: number,
  utterances: Utterance[],
) {
  const resolved = resolveDraft(target);
  if (!resolved) {
    return;
  }
  const { tableId, draft } = resolved;
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

export function failPendingSegment(
  target: number | TranscriptDraftContext,
  segmentId: string,
) {
  const resolved = resolveDraft(target);
  if (!resolved) {
    return;
  }
  const { tableId, draft } = resolved;
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

export function clearTranscriptDraft(target: number | TranscriptDraftContext) {
  const tableId = typeof target === 'number' ? target : target.tableId;
  try {
    // 계정이 바뀐 직후에도 자신이 시작한 초안만 폐기할 수 있어야 함.
    const raw = sessionStorage.getItem(draftKey(tableId));
    const saved = raw ? JSON.parse(raw) : null;
    if (
      (typeof target === 'number' && saved?.memberId === currentMemberId()) ||
      (typeof target !== 'number' &&
        saved?.draftId === target.draftId &&
        saved?.memberId === target.memberId)
    ) {
      sessionStorage.removeItem(draftKey(tableId));
    }
  } catch {
    /* 저장소 차단·손상은 새 초안 생성으로 보완하지 않음. */
  }
}

export function setSubmittedTranscriptId(
  target: number | TranscriptDraftContext,
  transcriptId: number,
) {
  const tableId = typeof target === 'number' ? target : target.tableId;
  if (typeof target !== 'number' && !resolveDraft(target)) {
    return;
  }
  sessionStorage.setItem(
    submittedKey(tableId),
    JSON.stringify({ memberId: currentMemberId(), transcriptId }),
  );
}

export function getSubmittedTranscriptId(tableId: number): number | null {
  try {
    const raw = sessionStorage.getItem(submittedKey(tableId));
    const saved = raw ? JSON.parse(raw) : null;
    return saved?.memberId === currentMemberId() &&
      Number.isInteger(saved?.transcriptId)
      ? saved.transcriptId
      : null;
  } catch {
    return null;
  }
}
