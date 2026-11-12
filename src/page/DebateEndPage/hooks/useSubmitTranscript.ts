import { useCallback, useEffect, useRef, useState } from 'react';
import { getAuthRevision } from '../../../util/accessToken';
import usePostTranscript from '../../../hooks/mutations/usePostTranscript';
import {
  clearTranscriptDraft,
  getTranscriptDraftContext,
  isTranscriptDraftCurrent,
  countPendingSegments,
  getSubmittedTranscriptId,
  getTranscriptDraft,
  hasTranscriptDraft,
  setSubmittedTranscriptId,
  toSpeechSegments,
} from '../../../util/transcriptDraft';

export type SubmitTranscriptStatus =
  'none' | 'transcribing' | 'submitting' | 'ready' | 'error';

// Soniox 전사 결과는 타이머 화면에서 시작한 요청이 초안(sessionStorage)에 직접 쓰므로 주기적으로 다시 읽는다.
export const PENDING_POLL_INTERVAL_MS = 500;

function readPendingCount(tableId: number): number {
  const draft = getTranscriptDraft(tableId);
  return draft ? countPendingSegments(draft, Date.now()) : 0;
}

/**
 * 토론 종료 화면에 들어오면 타이머 화면에서 쌓은 기록 초안을 서버로 한 번 보낸다.
 * Soniox 모드에서 아직 전사 중인 구간이 있으면 모두 끝난 뒤 보낸다.
 * 받은 기록 ID는 테이블별로 보관해 새로고침해도 다시 보내지 않는다.
 */
export default function useSubmitTranscript(tableId: number) {
  const [transcriptId, setTranscriptId] = useState<number | null>(() =>
    getSubmittedTranscriptId(tableId),
  );
  const [hasDraft, setHasDraft] = useState(() => hasTranscriptDraft(tableId));
  const [pendingCount, setPendingCount] = useState(() =>
    readPendingCount(tableId),
  );
  const [isFailed, setIsFailed] = useState(false);
  const hasRequestedRef = useRef(false);
  const identityRef = useRef({ tableId, revision: getAuthRevision() });

  useEffect(() => {
    if (identityRef.current.tableId !== tableId) {
      identityRef.current = { tableId, revision: getAuthRevision() };
      hasRequestedRef.current = false;
      setTranscriptId(getSubmittedTranscriptId(tableId));
      setHasDraft(hasTranscriptDraft(tableId));
      setPendingCount(readPendingCount(tableId));
      setIsFailed(false);
    }
    const handleIdentity = () => {
      if (identityRef.current.revision !== getAuthRevision()) {
        hasRequestedRef.current = true;
        setTranscriptId(null);
        setHasDraft(false);
        setPendingCount(0);
        setIsFailed(false);
      }
    };
    window.addEventListener('auth-changed', handleIdentity);
    window.addEventListener('storage', handleIdentity);
    return () => {
      window.removeEventListener('auth-changed', handleIdentity);
      window.removeEventListener('storage', handleIdentity);
    };
  }, [tableId]);

  // 요청 상태는 Mutation 관찰자 대신 콜백으로 직접 관리한다.
  // StrictMode의 effect 재실행 중 시작한 요청은 관찰자 상태가 갱신되지 않을 수 있다.
  const { mutate, isPending } = usePostTranscript(
    (id, context) => {
      if (!isTranscriptDraftCurrent(context)) {
        return;
      }
      setSubmittedTranscriptId(context, id);
      clearTranscriptDraft(context);
      if (context.tableId === identityRef.current.tableId) {
        setTranscriptId(id);
      }
    },
    (context) => {
      if (
        context.tableId === identityRef.current.tableId &&
        isTranscriptDraftCurrent(context)
      ) {
        setIsFailed(true);
      }
    },
  );

  const submit = useCallback(() => {
    const draft = getTranscriptDraft(tableId);
    const context = getTranscriptDraftContext(tableId);
    if (!draft || !context || isPending) {
      return;
    }
    setIsFailed(false);
    mutate({
      context,
      body: { segments: toSpeechSegments(draft), sttMode: draft.sttMode },
    });
  }, [isPending, mutate, tableId]);

  useEffect(() => {
    if (pendingCount === 0) {
      return;
    }
    const timer = setInterval(() => {
      const nextPendingCount = readPendingCount(tableId);
      setPendingCount(nextPendingCount);
      if (nextPendingCount === 0) {
        setHasDraft(hasTranscriptDraft(tableId));
      }
    }, PENDING_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [pendingCount, tableId]);

  useEffect(() => {
    if (
      isPending ||
      hasRequestedRef.current ||
      transcriptId !== null ||
      !hasDraft ||
      pendingCount > 0
    ) {
      return;
    }
    hasRequestedRef.current = true;
    submit();
  }, [hasDraft, isPending, pendingCount, submit, transcriptId]);

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

  return { status: getStatus(), transcriptId, pendingCount, retry: submit };
}
