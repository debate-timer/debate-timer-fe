import { TranscriptLine } from '../../types/transcript';
import { formatOffset, groupTranscriptLines } from './transcriptFormatting';

const line = (
  index: number,
  timeBoxIndex: number,
  overrides: Partial<TranscriptLine> = {},
): TranscriptLine => ({
  index,
  timeBoxIndex,
  speechType: '입론',
  stance: 'PROS',
  speaker: null,
  offsetMs: index * 1000,
  text: `발언 ${index}`,
  ...overrides,
});

describe('formatOffset', () => {
  it.each([
    [0, '00:00'],
    [65_000, '01:05'],
    [3_599_999, '59:59'],
    [3_600_000, '60:00'],
  ])('%i ms를 %s로 표시한다', (ms, expected) => {
    expect(formatOffset(ms)).toBe(expected);
  });
});

describe('groupTranscriptLines', () => {
  it('연속한 같은 타임박스 발언을 한 구간으로 묶는다', () => {
    const groups = groupTranscriptLines([
      line(0, 0),
      line(1, 0),
      line(2, 1, { speechType: '교차조사', stance: 'CONS' }),
      line(3, 0),
    ]);

    expect(
      groups.map((group) => group.lines.map(({ index }) => index)),
    ).toEqual([[0, 1], [2], [3]]);
    expect(groups[1]).toEqual(
      expect.objectContaining({ speechType: '교차조사', timeBoxIndex: 1 }),
    );
  });

  it('발언이 없으면 빈 목록을 돌려준다', () => {
    expect(groupTranscriptLines([])).toEqual([]);
  });
});
