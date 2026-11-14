import { postRecordingFinishV2 } from '../../apis/apis/recordingV2';
import { usePreventDuplicateMutation } from './usePreventDuplicateMutation';

/**
 * 사회자가 다기기 녹음 세션을 끝낸다. 이미 끝낸 세션이어도 서버는 그대로 성공으로 응답함.
 * 콜백은 요청한 세션 키를 받으므로, 호출부가 이전 세션의 늦은 응답을 걸러낼 수 있다.
 */
export default function usePostRecordingFinishV2(
  onSuccess: (sessionKey: string) => void,
  onError: (sessionKey: string) => void,
) {
  return usePreventDuplicateMutation({
    mutationFn: (sessionKey: string) => postRecordingFinishV2(sessionKey),
    onSuccess: (_data, sessionKey) => onSuccess(sessionKey),
    onError: (_error, sessionKey) => onError(sessionKey),
    throwOnError: false,
  });
}
