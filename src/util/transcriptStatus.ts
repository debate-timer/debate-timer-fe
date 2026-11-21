import { TranscriptStatus } from '../types/transcript';

/**
 * 토론 기록이 아직 만들어지는 중(보정·분석 중)인지 판정함.
 * 실패한 기록은 다듬는 중 표시가 남아 있어도 생성 중으로 보지 않아, 실패 안내를 보여주고 재조회를 멈추게 함.
 */
export function isTranscriptGenerating(transcript: {
  status: TranscriptStatus;
  refining: boolean;
}): boolean {
  return (
    transcript.status !== 'FAILED' &&
    (transcript.refining || transcript.status === 'PROCESSING')
  );
}
