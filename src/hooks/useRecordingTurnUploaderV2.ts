import { useCallback, useRef, useState } from 'react';
import { postRecordingTurnV2 } from '../apis/apis/recordingV2';
import { APIError } from '../apis/primitives';
import { PostRecordingTurnV2RequestType } from '../apis/requests/recordingV2';

export type RecordingTurnUploadOutcome = 'uploaded' | 'rejected' | 'failed';

// 업로드가 끝나기 전에 세션이 바뀔 수 있으므로, 두 함수는 업로드한 턴의 세션 키 기준으로만 토큰을 다룬다.
interface UseRecordingTurnUploaderV2Options {
  // 이 세션에서 쓸 기기 토큰. 아직 없으면 null이다.
  getDeviceToken: (sessionKey: string) => string | null;
  // 서버가 기기 토큰을 거절하면(재시작으로 참가 기록을 잃음 등) 이 세션에 다시 참가해 새 토큰을 받는다.
  // 이 세션에 더는 참가할 수 없으면 거부한다.
  renewDeviceToken: (sessionKey: string) => Promise<string>;
}

interface RecordingTurnUpload {
  sessionKey: string;
  turnKey: string;
  turn: PostRecordingTurnV2RequestType;
}

/**
 * 다기기 녹음 V2의 턴 녹음을 올리고 대기·실패 수를 센다. 사회자·청중 기기가 같은 복구 규칙을 쓴다.
 * - 403(기기 토큰 무효)이면 새 토큰을 받아 한 번만 다시 올린다.
 * - 여러 업로드가 함께 403을 받아도 세션마다 재참가는 한 번만 한다. 사회자는 재참가할 때마다 이전 사회자 기기가
 *   지워져 먼저 받은 토큰이 무효가 되고, 청중은 재참가할 때마다 기기가 늘어 정원을 쓰기 때문이다.
 * - 409(이미 마감된 턴·끝난 세션)는 서버가 받지 않는 정상 경우라 실패로 세지 않는다.
 */
export default function useRecordingTurnUploaderV2({
  getDeviceToken,
  renewDeviceToken,
}: UseRecordingTurnUploaderV2Options) {
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  // 초기화 뒤에 끝난 이전 업로드가 새 수를 바꾸지 않게 한다.
  const generationRef = useRef(0);
  // 세션별로 진행 중인 재참가. 함께 403을 받은 업로드는 이 결과를 같이 기다린다.
  const renewingRef = useRef(new Map<string, Promise<string>>());

  // 실패한 요청에 쓴 토큰과 지금 토큰이 다르면 다른 업로드가 이미 새로 받은 것이므로 재참가하지 않는다.
  const renewOnce = useCallback(
    (sessionKey: string, failedToken: string | null): Promise<string> => {
      const current = getDeviceToken(sessionKey);
      if (current !== null && current !== failedToken) {
        return Promise.resolve(current);
      }
      const inFlight = renewingRef.current.get(sessionKey);
      if (inFlight) {
        return inFlight;
      }
      const renewing = renewDeviceToken(sessionKey).finally(() => {
        renewingRef.current.delete(sessionKey);
      });
      renewingRef.current.set(sessionKey, renewing);
      return renewing;
    },
    [getDeviceToken, renewDeviceToken],
  );

  const upload = useCallback(
    async ({
      sessionKey,
      turnKey,
      turn,
    }: RecordingTurnUpload): Promise<RecordingTurnUploadOutcome> => {
      const generation = generationRef.current;
      const isCurrent = () => generation === generationRef.current;
      setPendingCount((prev) => prev + 1);
      const outcome = await uploadWithRecovery(
        () => getDeviceToken(sessionKey),
        (failedToken) => renewOnce(sessionKey, failedToken),
        (deviceToken) =>
          postRecordingTurnV2(sessionKey, turnKey, deviceToken, turn),
      );
      if (isCurrent()) {
        setPendingCount((prev) => prev - 1);
        if (outcome === 'failed') {
          setFailedCount((prev) => prev + 1);
        }
      }
      return outcome;
    },
    [getDeviceToken, renewOnce],
  );

  const reset = useCallback(() => {
    generationRef.current += 1;
    setPendingCount(0);
    setFailedCount(0);
  }, []);

  return { pendingCount, failedCount, upload, reset };
}

async function uploadWithRecovery(
  getDeviceToken: () => string | null,
  renewDeviceToken: (failedToken: string | null) => Promise<string>,
  send: (deviceToken: string) => Promise<void>,
): Promise<RecordingTurnUploadOutcome> {
  let deviceToken: string | null = null;
  try {
    deviceToken = getDeviceToken() ?? (await renewDeviceToken(null));
    await send(deviceToken);
    return 'uploaded';
  } catch (error) {
    if (!(error instanceof APIError) || error.status !== 403) {
      return toOutcome(error);
    }
  }
  try {
    await send(await renewDeviceToken(deviceToken));
    return 'uploaded';
  } catch (error) {
    return toOutcome(error);
  }
}

function toOutcome(error: unknown): RecordingTurnUploadOutcome {
  return error instanceof APIError && error.status === 409
    ? 'rejected'
    : 'failed';
}
