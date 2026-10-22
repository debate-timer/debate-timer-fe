import { ApiUrl } from '../endpoints';
import { request } from '../primitives';
import { PostSonioxTranscriptionResponseType } from '../responses/stt';

// 서버가 Soniox 전사를 마칠 때까지(최대 3분) 기다린다.
const SONIOX_TRANSCRIPTION_TIMEOUT_MS = 200_000;

// POST /api/stt/soniox
export async function postSonioxTranscription(
  audio: Blob,
  fileName: string,
  language: string,
): Promise<PostSonioxTranscriptionResponseType> {
  const body = new FormData();
  body.append('audio', audio, fileName);
  body.append('language', language);
  const response = await request<PostSonioxTranscriptionResponseType>(
    'POST',
    `${ApiUrl.stt}/soniox`,
    body,
    null,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: SONIOX_TRANSCRIPTION_TIMEOUT_MS,
    },
  );

  return response.data;
}
