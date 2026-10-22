import {
  appendUtterance,
  clearTranscriptDraft,
  getSubmittedTranscriptId,
  getTranscriptDraft,
  hasTranscriptDraft,
  setSubmittedTranscriptId,
  startTranscriptDraft,
} from './transcriptDraft';

describe('토론 기록 초안 저장소', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('기록을 시작하면 빈 초안과 시작 시각을 저장한다', () => {
    startTranscriptDraft(3, 1000);

    expect(getTranscriptDraft(3)).toEqual({ startedAt: 1000, segments: [] });
    expect(hasTranscriptDraft(3)).toBe(false);
  });

  it('같은 구간 ID의 발언은 한 구간에 이어 붙인다', () => {
    startTranscriptDraft(3, 1000);

    appendUtterance(
      3,
      { id: 's1', timeBoxIndex: 0, team: null },
      '첫 문장',
      2000,
    );
    appendUtterance(
      3,
      { id: 's1', timeBoxIndex: 0, team: null },
      '둘째 문장',
      3500,
    );
    appendUtterance(
      3,
      { id: 's2', timeBoxIndex: 1, team: 'CONS' },
      '반대 발언',
      9000,
    );

    expect(getTranscriptDraft(3)?.segments).toEqual([
      {
        id: 's1',
        timeBoxIndex: 0,
        team: null,
        utterances: [
          { offsetMs: 1000, text: '첫 문장' },
          { offsetMs: 2500, text: '둘째 문장' },
        ],
      },
      {
        id: 's2',
        timeBoxIndex: 1,
        team: 'CONS',
        utterances: [{ offsetMs: 8000, text: '반대 발언' }],
      },
    ]);
    expect(hasTranscriptDraft(3)).toBe(true);
  });

  it.each(['', '   '])('빈 문장(%j)은 저장하지 않는다', (text) => {
    startTranscriptDraft(3, 1000);

    appendUtterance(3, { id: 's1', timeBoxIndex: 0, team: null }, text, 2000);

    expect(hasTranscriptDraft(3)).toBe(false);
  });

  it('초안이 없으면 발언을 저장하지 않는다', () => {
    appendUtterance(3, { id: 's1', timeBoxIndex: 0, team: null }, '문장', 2000);

    expect(getTranscriptDraft(3)).toBeNull();
  });

  it('제출한 기록 ID를 테이블별로 보관하고 새 기록 시작 시 지운다', () => {
    startTranscriptDraft(3, 1000);
    setSubmittedTranscriptId(3, 42);
    expect(getSubmittedTranscriptId(3)).toBe(42);

    startTranscriptDraft(3, 5000);
    expect(getSubmittedTranscriptId(3)).toBeNull();
  });

  it('초안을 지우면 다른 테이블 초안은 남긴다', () => {
    startTranscriptDraft(3, 1000);
    startTranscriptDraft(4, 1000);

    clearTranscriptDraft(3);

    expect(getTranscriptDraft(3)).toBeNull();
    expect(getTranscriptDraft(4)).not.toBeNull();
  });

  it('손상된 저장 값은 초안이 없는 것으로 본다', () => {
    sessionStorage.setItem('TranscriptDraft:3', '{broken');

    expect(getTranscriptDraft(3)).toBeNull();
  });
});
