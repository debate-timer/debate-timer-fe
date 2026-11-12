import { postTranscript } from '../../apis/apis/transcript';
import { PostTranscriptRequestType } from '../../apis/requests/transcript';
import { PostTranscriptResponseType } from '../../apis/responses/transcript';
import { TranscriptDraftContext } from '../../util/transcriptDraft';
import { usePreventDuplicateMutation } from './usePreventDuplicateMutation';

interface PostTranscriptVariables {
  body: PostTranscriptRequestType;
  context: TranscriptDraftContext;
}

/** 요청 변수에 초안 문맥을 보존해 늦은 응답도 시작한 초안으로만 전달함. */
export default function usePostTranscript(
  onSuccess: (id: number, context: TranscriptDraftContext) => void,
  onError: (context: TranscriptDraftContext) => void,
) {
  return usePreventDuplicateMutation({
    mutationFn: ({ body, context }: PostTranscriptVariables) =>
      postTranscript(
        context.tableId,
        body,
        context.memberId
          ? {
              expectedMemberId: context.memberId,
              expectedAuthRevision: context.authRevision,
            }
          : {},
      ),
    onSuccess: (response: PostTranscriptResponseType, variables) => {
      onSuccess(response.id, variables.context);
    },
    onError: (_error, variables) => onError(variables.context),
    throwOnError: false,
  });
}
