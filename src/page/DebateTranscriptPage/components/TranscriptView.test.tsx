import { render, screen } from '@testing-library/react';
import { TranscriptLine } from '../../../types/transcript';
import TranscriptView from './TranscriptView';

const line = (
  index: number,
  overrides: Partial<TranscriptLine> = {},
): TranscriptLine => ({
  index,
  timeBoxIndex: 2,
  speechType: '자유토론',
  stance: 'PROS',
  speaker: null,
  offsetMs: index * 2000,
  text: `문장 ${index}.`,
  ...overrides,
});

describe('TranscriptView', () => {
  it('같은 팀 문장이 이어지면 팀 이름을 한 번만 쓰고 한 발언으로 이어 보여준다', () => {
    render(
      <TranscriptView
        lines={[
          line(0),
          line(1),
          line(2, { stance: 'CONS' }),
          line(3, { stance: 'CONS' }),
        ]}
        highlightedLineIndex={null}
      />,
    );

    expect(screen.getAllByText('찬성')).toHaveLength(1);
    expect(screen.getAllByText('반대')).toHaveLength(1);
    expect(screen.getByText('문장 0.').closest('p')).toHaveTextContent(
      '문장 0. 문장 1.',
    );
    expect(screen.getByText('문장 2.').closest('p')).toHaveTextContent(
      '문장 2. 문장 3.',
    );
  });

  it('보고서에서 고른 문장은 합친 발언 안에서도 그 문장만 강조한다', () => {
    render(
      <TranscriptView lines={[line(0), line(1)]} highlightedLineIndex={1} />,
    );

    expect(document.getElementById('transcript-line-1')).toHaveClass(
      'bg-brand/40',
    );
    expect(document.getElementById('transcript-line-0')).not.toHaveClass(
      'bg-brand/40',
    );
  });
});
