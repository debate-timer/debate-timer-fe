import { postTranscript } from '../../apis/apis/transcript';
import { PostTranscriptRequestType } from '../../apis/requests/transcript';
import { PostTranscriptResponseType } from '../../apis/responses/transcript';
import { usePreventDuplicateMutation } from './usePreventDuplicateMutation';

interface PostTranscriptVariables {
  tableId: number;
  body: PostTranscriptRequestType;
}

// 실패는 종료 화면 배너에서 재시도로 복구하므로 전역 오류로 올리지 않는다.
export default function usePostTranscript(
  onSuccess: (id: number) => void,
  onError: () => void,
) {
  return usePreventDuplicateMutation({
    mutationFn: ({ tableId, body }: PostTranscriptVariables) =>
      postTranscript(tableId, body),
    onSuccess: (response: PostTranscriptResponseType) => {
      onSuccess(response.id);
    },
    onError,
    throwOnError: false,
  });
}
