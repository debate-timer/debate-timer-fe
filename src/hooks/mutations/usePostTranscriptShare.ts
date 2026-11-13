import { useQueryClient } from '@tanstack/react-query';
import { postTranscriptShare } from '../../apis/apis/transcript';
import {
  GetTranscriptResponseType,
  PostTranscriptShareResponseType,
} from '../../apis/responses/transcript';
import { usePreventDuplicateMutation } from './usePreventDuplicateMutation';

// 실패는 공유 모달에서 재시도로 복구하므로 전역 오류로 올리지 않는다.
export default function usePostTranscriptShare(
  onSuccess: (shareToken: string) => void,
  onError: () => void = () => {},
) {
  const queryClient = useQueryClient();

  return usePreventDuplicateMutation({
    mutationFn: (transcriptId: number) => postTranscriptShare(transcriptId),
    onSuccess: (response: PostTranscriptShareResponseType, transcriptId) => {
      queryClient.setQueryData<GetTranscriptResponseType>(
        ['Transcript', transcriptId],
        (prev) => prev && { ...prev, shareToken: response.shareToken },
      );
      onSuccess(response.shareToken);
    },
    onError,
    throwOnError: false,
  });
}
