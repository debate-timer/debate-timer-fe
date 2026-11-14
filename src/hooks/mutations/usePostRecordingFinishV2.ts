import { postRecordingFinishV2 } from '../../apis/apis/recordingV2';
import { usePreventDuplicateMutation } from './usePreventDuplicateMutation';

/** 사회자가 다기기 녹음 세션을 끝낸다. 이미 끝낸 세션이어도 서버는 그대로 성공으로 응답함. */
export default function usePostRecordingFinishV2(
  onSuccess: () => void,
  onError: () => void,
) {
  return usePreventDuplicateMutation({
    mutationFn: (sessionKey: string) => postRecordingFinishV2(sessionKey),
    onSuccess,
    onError,
    throwOnError: false,
  });
}
