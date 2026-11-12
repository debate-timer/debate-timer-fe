import { ApiUrl } from '../endpoints';
import { RequestOptions, request } from '../primitives';
import { PostSonioxTranscriptionResponseType } from '../responses/stt';

// 서버가 Soniox 전사를 마칠 때까지(최대 3분) 기다린다.
const SONIOX_TRANSCRIPTION_TIMEOUT_MS = 200_000;

// POST /api/stt/soniox
// sessionId는 한 번의 녹음(기록 시작~종료)을 묶는 식별자로, 서버가 구간 오디오를 세션별로 보관할 때 쓴다.
export async function postSonioxTranscription(
  audio: Blob,
  fileName: string,
  language: string,
  sessionId: string,
  options: Pick<
    RequestOptions,
    'expectedMemberId' | 'expectedAuthRevision'
  > = {},
): Promise<PostSonioxTranscriptionResponseType> {
  const body = new FormData();
  body.append('audio', audio, fileName);
  body.append('language', language);
  body.append('sessionId', sessionId);
  const response = await request<PostSonioxTranscriptionResponseType>(
    'POST',
    `${ApiUrl.stt}/soniox`,
    body,
    null,
    {
      ...options,
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: SONIOX_TRANSCRIPTION_TIMEOUT_MS,
    },
  );

  return response.data;
}
