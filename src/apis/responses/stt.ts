import { Utterance } from '../../types/transcript';

// POST /api/stt/soniox
// offsetMs는 보낸 구간 오디오의 시작 시점 기준이다.
export interface PostSonioxTranscriptionResponseType {
  utterances: Utterance[];
}
