import { useCallback, useEffect, useRef, useState } from 'react';
import usePostRecordingFinishV2 from '../../../hooks/mutations/usePostRecordingFinishV2';
import { useGetRecordingSessionV2 } from '../../../hooks/query/useGetRecordingSessionV2';
import { getHostRecordingV2 } from '../../../util/recordingStorageV2';

export type MultiDeviceTranscriptStatus =
  'none' | 'transcribing' | 'ready' | 'error';

/**
 * 토론 종료 화면에서 다기기 녹음 세션을 끝내고 서버가 속기록을 만들 때까지 기다린다.
 * 이 탭에서 연 녹음 세션이 없으면 아무것도 하지 않는다('none').
 * 서버는 끝낸 뒤에도 늦게 도착한 청중 녹음을 잠시 더 받고, 남은 턴을 전사한 뒤 속기록을 만든다.
 */
export default function useMultiDeviceTranscriptResult(tableId: number) {
  const [sessionKey] = useState(
    () => getHostRecordingV2(tableId)?.sessionKey ?? null,
  );
  const [isFinished, setIsFinished] = useState(false);
  const [isFinishFailed, setIsFinishFailed] = useState(false);
  const isFinishRequestedRef = useRef(false);

  const finish = usePostRecordingFinishV2(
    () => setIsFinished(true),
    () => setIsFinishFailed(true),
  );
  const { mutate } = finish;
  const sessionQuery = useGetRecordingSessionV2(sessionKey, isFinished);

  const requestFinish = useCallback(() => {
    if (sessionKey === null) {
      return;
    }
    setIsFinishFailed(false);
    mutate(sessionKey);
  }, [mutate, sessionKey]);

  useEffect(() => {
    if (isFinishRequestedRef.current) {
      return;
    }
    isFinishRequestedRef.current = true;
    requestFinish();
  }, [requestFinish]);

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
