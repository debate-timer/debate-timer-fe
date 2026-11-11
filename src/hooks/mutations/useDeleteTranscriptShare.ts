import { useQueryClient } from '@tanstack/react-query';
import { deleteTranscriptShare } from '../../apis/apis/transcript';
import { GetTranscriptResponseType } from '../../apis/responses/transcript';
import { usePreventDuplicateMutation } from './usePreventDuplicateMutation';

// 실패는 공유 모달에서 다시 누를 수 있으므로 전역 오류로 올리지 않는다.
export default function useDeleteTranscriptShare(
  onSuccess: () => void,
  onError: () => void = () => {},
) {
  const queryClient = useQueryClient();

  return usePreventDuplicateMutation({
    mutationFn: (transcriptId: number) => deleteTranscriptShare(transcriptId),
    onSuccess: (_, transcriptId) => {
      queryClient.setQueryData<GetTranscriptResponseType>(
        ['Transcript', transcriptId],
        (prev) => prev && { ...prev, shareToken: null },
      );
      onSuccess();
    },
    onError,
    throwOnError: false,
  });
}
