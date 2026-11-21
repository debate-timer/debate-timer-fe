import { isTranscriptGenerating } from './transcriptStatus';

describe('토론 기록 생성 중 판정', () => {
  it.each([
    ['PROCESSING', false, true],
    ['DONE', true, true],
    ['DONE', false, false],
    ['FAILED', false, false],
    ['FAILED', true, false],
  ] as const)(
    '%s 상태이고 다듬는 중 표시가 %s이면 생성 중 여부는 %s이다',
    (status, refining, expected) => {
      expect(isTranscriptGenerating({ status, refining })).toBe(expected);
    },
  );
});
