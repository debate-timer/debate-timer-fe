import { useCallback, useEffect, useState } from 'react';
import {
  countPendingSegments,
  getSubmittedTranscriptId,
  getTranscriptDraft,
  hasTranscriptDraft,
  markTranscriptDraftEnded,
  retryTranscriptSubmit,
  TRANSCRIPT_DRAFT_CHANGE_EVENT,
} from '../../../util/transcriptDraft';

// 'error'는 다시 보낼 수 있는 실패, 'failed'는 서버가 기록을 만들지 못하고 끝내 다시 시도해도 바뀌지 않는 실패다.
export type SubmitTranscriptStatus =
  'none' | 'transcribing' | 'submitting' | 'ready' | 'error' | 'failed';

// 전사 대기 만료는 초안 변경 없이 오므로 대기 중에는 주기적으로 다시 읽는다.
export const PENDING_POLL_INTERVAL_MS = 500;

interface SubmitSnapshot {
  transcriptId: number | null;
  pendingCount: number;
  hasDraft: boolean;
  isFailed: boolean;
}

function readSnapshot(tableId: number): SubmitSnapshot {
  const draft = getTranscriptDraft(tableId);
  return {
    transcriptId: getSubmittedTranscriptId(tableId),
    pendingCount: draft ? countPendingSegments(draft, Date.now()) : 0,
    hasDraft: hasTranscriptDraft(tableId),
    isFailed: draft?.isSubmitFailed ?? false,
  };
}

function isSameSnapshot(a: SubmitSnapshot, b: SubmitSnapshot) {
  return (
    a.transcriptId === b.transcriptId &&
    a.pendingCount === b.pendingCount &&
    a.hasDraft === b.hasDraft &&
    a.isFailed === b.isFailed
  );
}

/**
 * 토론 종료 화면에 들어오면 타이머 화면에서 쌓은 기록 초안을 끝낸 것으로 표시한다.
 * 제출은 앱 수명의 `useTranscriptDraftSubmitter`가 맡으므로 이 화면을 바로 떠나도 이어진다.
 * 이 훅은 초안의 전사 대기·제출 결과를 읽어 표시 상태로 돌려준다.
 */
export default function useSubmitTranscript(tableId: number) {
  const [snapshot, setSnapshot] = useState(() => readSnapshot(tableId));

  const refresh = useCallback(
    () =>
      setSnapshot((previous) => {
        const next = readSnapshot(tableId);
        return isSameSnapshot(previous, next) ? previous : next;
      }),
    [tableId],
  );

  useEffect(() => {
    markTranscriptDraftEnded(tableId, Date.now());
    refresh();
    window.addEventListener(TRANSCRIPT_DRAFT_CHANGE_EVENT, refresh);
    return () =>
      window.removeEventListener(TRANSCRIPT_DRAFT_CHANGE_EVENT, refresh);
  }, [refresh, tableId]);

  const { transcriptId, pendingCount, hasDraft, isFailed } = snapshot;

  useEffect(() => {
    if (pendingCount === 0) {
      return;
    }
    const timer = setInterval(refresh, PENDING_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [pendingCount, refresh]);

  const retry = useCallback(() => retryTranscriptSubmit(tableId), [tableId]);

  const getStatus = (): SubmitTranscriptStatus => {
    if (transcriptId !== null) {
      return 'ready';
    }
    if (isFailed) {
      return 'error';
    }
    if (pendingCount > 0) {
      return 'transcribing';
    }
    if (hasDraft) {
      return 'submitting';
    }
    return 'none';
  };

  return { status: getStatus(), transcriptId, pendingCount, retry };
}
