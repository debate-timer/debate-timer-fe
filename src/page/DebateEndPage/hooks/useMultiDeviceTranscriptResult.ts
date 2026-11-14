import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import usePostRecordingFinishV2 from '../../../hooks/mutations/usePostRecordingFinishV2';
import { useGetRecordingSessionV2 } from '../../../hooks/query/useGetRecordingSessionV2';
import { getHostRecordingV2 } from '../../../util/recordingStorageV2';

export type MultiDeviceTranscriptStatus =
  'none' | 'transcribing' | 'ready' | 'error';

/**
 * 토론 종료 화면에서 다기기 녹음 세션을 끝내고 서버가 속기록을 만들 때까지 기다린다.
 * 이 탭에서 연 녹음 세션이 없으면 아무것도 하지 않는다('none').
 * 서버는 끝낸 뒤에도 늦게 도착한 청중 녹음을 잠시 더 받고, 남은 턴을 전사한 뒤 속기록을 만든다.
 * tableId가 바뀌면 그 테이블의 세션으로 다시 시작하고, 이전 세션의 늦은 응답은 반영하지 않는다.
 */
export default function useMultiDeviceTranscriptResult(tableId: number) {
  const sessionKey = useMemo(
    () => getHostRecordingV2(tableId)?.sessionKey ?? null,
    [tableId],
  );
  // 끝내기 결과를 세션 키로 남겨, 다른 세션의 결과가 지금 세션 상태로 보이지 않게 한다.
  const [finishedSessionKey, setFinishedSessionKey] = useState<string | null>(
    null,
  );
  const [failedSessionKey, setFailedSessionKey] = useState<string | null>(null);
  const requestedSessionKeyRef = useRef<string | null>(null);
  const isFinished = sessionKey !== null && finishedSessionKey === sessionKey;
  const isFinishFailed = sessionKey !== null && failedSessionKey === sessionKey;

  const finish = usePostRecordingFinishV2(
    (finishedKey) => setFinishedSessionKey(finishedKey),
    (failedKey) => setFailedSessionKey(failedKey),
  );
  const { mutate, isPending: isFinishPending } = finish;
  const sessionQuery = useGetRecordingSessionV2(sessionKey, isFinished);

  const requestFinish = useCallback(() => {
    if (sessionKey === null) {
      return;
    }
    setFailedSessionKey(null);
    mutate(sessionKey);
  }, [mutate, sessionKey]);

  // 세션마다 한 번 끝낸다. 이전 세션의 요청이 아직 진행 중이면 끝난 뒤에 보낸다(중복 요청은 무시되므로).
  useEffect(() => {
    if (
      sessionKey === null ||
      requestedSessionKeyRef.current === sessionKey ||
      isFinishPending
    ) {
      return;
    }
    requestedSessionKeyRef.current = sessionKey;
    requestFinish();
  }, [isFinishPending, requestFinish, sessionKey]);

  const retry = useCallback(() => {
    if (!isFinished) {
      requestFinish();
      return;
    }
    void sessionQuery.refetch();
  }, [isFinished, requestFinish, sessionQuery]);

  const data = sessionQuery.data;
  const status: MultiDeviceTranscriptStatus = (() => {
    if (sessionKey === null) {
      return 'none';
    }
    if (isFinishFailed || sessionQuery.isError || data?.status === 'FAILED') {
      return 'error';
    }
    if (data?.status === 'COMPLETED' && data.transcriptId !== null) {
      return 'ready';
    }
    return 'transcribing';
  })();

  return {
    status,
    transcriptId: status === 'ready' ? (data?.transcriptId ?? null) : null,
    retry,
  };
}
