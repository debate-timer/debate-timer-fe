import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { getRecordingSessionV2 } from '../../apis/apis/recordingV2';
import { GetRecordingSessionV2ResponseType } from '../../apis/responses/recordingV2';

const POLLING_INTERVAL_MS = 2000;
const DEFAULT_RETRY_COUNT = 3;
// 서버는 속기록 ID와 함께 COMPLETED로 바꾸지만, ID 없이 COMPLETED가 오면 이 횟수(약 30초)만큼 더 조회한 뒤 오류로 본다.
const MAX_MISSING_TRANSCRIPT_POLLS = 15;

export class MissingTranscriptIdError extends Error {
  constructor() {
    super('속기록 ID 없이 녹음 세션이 끝났습니다.');
    this.name = 'MissingTranscriptIdError';
  }
}

const isMissingTranscript = (session: GetRecordingSessionV2ResponseType) =>
  session.status === 'COMPLETED' && session.transcriptId === null;

// 서버가 남은 턴을 전사하고 속기록을 만들 때까지(속기록 ID가 있는 COMPLETED·FAILED 전) 주기적으로 다시 조회한다.
export function useGetRecordingSessionV2(
  sessionKey: string | null,
  enabled: boolean,
) {
  // 속기록 ID 없이 COMPLETED를 연달아 받은 횟수
  const missingTranscriptPollsRef = useRef({ sessionKey, count: 0 });

  return useQuery<GetRecordingSessionV2ResponseType>({
    queryKey: ['RecordingSessionV2', sessionKey],
    queryFn: async () => {
      const key = sessionKey ?? '';
      const session = await getRecordingSessionV2(key);
      const polls = missingTranscriptPollsRef.current;
      if (polls.sessionKey !== sessionKey || !isMissingTranscript(session)) {
        missingTranscriptPollsRef.current = { sessionKey, count: 0 };
        return session;
      }
      polls.count += 1;
      if (polls.count >= MAX_MISSING_TRANSCRIPT_POLLS) {
        // 다시 시도하면 처음부터 다시 기다린다.
        polls.count = 0;
        throw new MissingTranscriptIdError();
      }
      return session;
    },
    enabled: enabled && sessionKey !== null,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (
        query.state.error instanceof MissingTranscriptIdError ||
        data?.status === 'FAILED' ||
        (data?.status === 'COMPLETED' && data.transcriptId !== null)
      ) {
        return false;
      }
      return POLLING_INTERVAL_MS;
    },
    retry: (failureCount, error) =>
      !(error instanceof MissingTranscriptIdError) &&
      failureCount < DEFAULT_RETRY_COUNT,
    throwOnError: false,
  });
}
