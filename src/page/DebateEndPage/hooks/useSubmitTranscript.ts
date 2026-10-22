import { useCallback, useEffect, useRef, useState } from 'react';
import usePostTranscript from '../../../hooks/mutations/usePostTranscript';
import {
  clearTranscriptDraft,
  getSubmittedTranscriptId,
  getTranscriptDraft,
  hasTranscriptDraft,
  setSubmittedTranscriptId,
  toSpeechSegments,
} from '../../../util/transcriptDraft';

export type SubmitTranscriptStatus = 'none' | 'submitting' | 'ready' | 'error';

/**
 * 토론 종료 화면에 들어오면 타이머 화면에서 쌓은 기록 초안을 서버로 한 번 보낸다.
 * 받은 기록 ID는 테이블별로 보관해 새로고침해도 다시 보내지 않는다.
 */
export default function useSubmitTranscript(tableId: number) {
  const [transcriptId, setTranscriptId] = useState<number | null>(() =>
    getSubmittedTranscriptId(tableId),
  );
  const [hasDraft] = useState(() => hasTranscriptDraft(tableId));
  const [isFailed, setIsFailed] = useState(false);
  const hasRequestedRef = useRef(false);

  // 요청 상태는 Mutation 관찰자 대신 콜백으로 직접 관리한다.
  // StrictMode의 effect 재실행 중 시작한 요청은 관찰자 상태가 갱신되지 않을 수 있다.
  const { mutate } = usePostTranscript(
    (id) => {
      setSubmittedTranscriptId(tableId, id);
      clearTranscriptDraft(tableId);
      setTranscriptId(id);
    },
    () => setIsFailed(true),
  );

  const submit = useCallback(() => {
    const draft = getTranscriptDraft(tableId);
    if (!draft) {
      return;
    }
    setIsFailed(false);
    mutate({
      tableId,
      body: { segments: toSpeechSegments(draft), sttMode: draft.sttMode },
    });
  }, [mutate, tableId]);

  useEffect(() => {
    if (hasRequestedRef.current || transcriptId !== null || !hasDraft) {
      return;
    }
    hasRequestedRef.current = true;
    submit();
  }, [hasDraft, submit, transcriptId]);

  const getStatus = (): SubmitTranscriptStatus => {
    if (transcriptId !== null) return 'ready';
    if (isFailed) return 'error';
    if (hasDraft) return 'submitting';
    return 'none';
  };

  return { status: getStatus(), transcriptId, retry: submit };
}
