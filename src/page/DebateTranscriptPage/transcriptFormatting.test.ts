import { TranscriptLine } from '../../types/transcript';
import {
  formatOffset,
  groupTranscriptLines,
  mergeSpeeches,
} from './transcriptFormatting';

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

describe('경과 시간 표시', () => {
  it.each([
    [0, '00:00'],
    [65_000, '01:05'],
    [3_599_999, '59:59'],
    [3_600_000, '60:00'],
  ])('%i ms를 %s로 표시한다', (ms, expected) => {
    expect(formatOffset(ms)).toBe(expected);
  });
});

describe('타임박스 구간 묶기', () => {
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

describe('같은 팀 발언 합치기', () => {
  it('같은 팀 문장이 이어지면 하나의 발언으로 합치고 팀이 바뀌면 새 발언을 시작한다', () => {
    const speeches = mergeSpeeches([
      line(0, 2, { stance: 'PROS', offsetMs: 1000 }),
      line(1, 2, { stance: 'PROS', offsetMs: 3000 }),
      line(2, 2, { stance: 'CONS', offsetMs: 5000 }),
      line(3, 2, { stance: 'CONS', offsetMs: 7000 }),
      line(4, 2, { stance: 'PROS', offsetMs: 9000 }),
    ]);

    expect(
      speeches.map(({ stance, offsetMs, lines }) => ({
        stance,
        offsetMs,
        indices: lines.map(({ index }) => index),
      })),
    ).toEqual([
      { stance: 'PROS', offsetMs: 1000, indices: [0, 1] },
      { stance: 'CONS', offsetMs: 5000, indices: [2, 3] },
      { stance: 'PROS', offsetMs: 9000, indices: [4] },
    ]);
  });

  it('같은 팀이라도 화자가 바뀌면 다른 발언으로 나눈다', () => {
    const speeches = mergeSpeeches([
      line(0, 0, { speaker: '콜리' }),
      line(1, 0, { speaker: '비토' }),
    ]);

    expect(speeches.map(({ speaker }) => speaker)).toEqual(['콜리', '비토']);
  });

  it('발언이 없으면 빈 목록을 돌려준다', () => {
    expect(mergeSpeeches([])).toEqual([]);
  });
});

describe('타임박스 구간의 발언 합치기', () => {
  it('구간마다 같은 팀이 이어진 문장을 발언으로 합쳐 둔다', () => {
    const groups = groupTranscriptLines([
      line(0, 0),
      line(1, 0),
      line(2, 1, { stance: 'CONS' }),
    ]);

    expect(
      groups.map((group) =>
        group.speeches.map((speech) => speech.lines.length),
      ),
    ).toEqual([[2], [1]]);
  });
});
