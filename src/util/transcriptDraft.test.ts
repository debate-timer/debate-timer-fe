import {
  appendSegmentUtterances,
  appendUtterance,
  clearTranscriptDraft,
  countPendingSegments,
  failPendingSegment,
  markSegmentPending,
  PENDING_SEGMENT_TIMEOUT_MS,
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

    expect(getTranscriptDraft(3)).toEqual({
      startedAt: 1000,
      sttMode: 'RPC',
      segments: [],
      pendingSegments: [],
      failedSegmentCount: 0,
    });
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

  it('STT 모드 필드가 없는 이전 초안은 RPC 모드로 읽는다', () => {
    sessionStorage.setItem(
      'TranscriptDraft:3',
      JSON.stringify({ startedAt: 1000, segments: [] }),
    );

    expect(getTranscriptDraft(3)).toMatchObject({
      sttMode: 'RPC',
      pendingSegments: [],
      failedSegmentCount: 0,
    });
  });

  describe('Soniox 구간 배치 전사', () => {
    const SEGMENT = { id: 's1', timeBoxIndex: 2, team: 'PROS' as const };

    it('선택한 STT 모드로 초안을 시작한다', () => {
      startTranscriptDraft(3, 1000, 'SONIOX');

      expect(getTranscriptDraft(3)?.sttMode).toBe('SONIOX');
    });

    it('전사 중인 구간이 있으면 발언이 없어도 보낼 초안이 있는 것으로 본다', () => {
      startTranscriptDraft(3, 1000, 'SONIOX');

      markSegmentPending(3, 's1', 5000);

      expect(countPendingSegments(getTranscriptDraft(3)!, 5000)).toBe(1);
      expect(hasTranscriptDraft(3, 5000)).toBe(true);
    });

    it('구간 전사 결과를 기록 시작 기준 시각으로 바꿔 저장하고 대기에서 뺀다', () => {
      startTranscriptDraft(3, 1000, 'SONIOX');
      markSegmentPending(3, 's1', 9000);

      appendSegmentUtterances(3, SEGMENT, 4000, [
        { offsetMs: 500, text: ' 찬성 입론입니다. ' },
        { offsetMs: 2000, text: '  ' },
        { offsetMs: 3000, text: '감사합니다.' },
      ]);

      const draft = getTranscriptDraft(3)!;
      expect(draft.segments).toEqual([
        {
          ...SEGMENT,
          utterances: [
            { offsetMs: 3500, text: '찬성 입론입니다.' },
            { offsetMs: 6000, text: '감사합니다.' },
          ],
        },
      ]);
      expect(countPendingSegments(draft, 9000)).toBe(0);
    });

    it('전사할 문장이 없으면 구간을 만들지 않고 대기에서만 뺀다', () => {
      startTranscriptDraft(3, 1000, 'SONIOX');
      markSegmentPending(3, 's1', 9000);

      appendSegmentUtterances(3, SEGMENT, 4000, []);

      expect(getTranscriptDraft(3)?.segments).toEqual([]);
      expect(hasTranscriptDraft(3, 9000)).toBe(false);
    });

    it('전사에 실패한 구간은 대기에서 빼고 실패 수를 센다', () => {
      startTranscriptDraft(3, 1000, 'SONIOX');
      markSegmentPending(3, 's1', 9000);

      failPendingSegment(3, 's1');

      const draft = getTranscriptDraft(3)!;
      expect(countPendingSegments(draft, 9000)).toBe(0);
      expect(draft.failedSegmentCount).toBe(1);
    });

    it('제한 시간이 지난 대기 구간은 새로고침 등으로 끊긴 것으로 보고 세지 않는다', () => {
      startTranscriptDraft(3, 1000, 'SONIOX');
      markSegmentPending(3, 's1', 9000);

      const draft = getTranscriptDraft(3)!;

      expect(
        countPendingSegments(draft, 9000 + PENDING_SEGMENT_TIMEOUT_MS - 1),
      ).toBe(1);
      expect(countPendingSegments(draft, 9000 + PENDING_SEGMENT_TIMEOUT_MS)).toBe(
        0,
      );
    });
  });
});
