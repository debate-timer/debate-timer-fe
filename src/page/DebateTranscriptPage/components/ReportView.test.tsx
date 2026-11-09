import { render, screen } from '@testing-library/react';
import { DebateReport, TranscriptLine } from '../../../types/transcript';
import ReportView from './ReportView';

const lines: TranscriptLine[] = [
  {
    index: 0,
    timeBoxIndex: 0,
    speechType: '입론',
    stance: 'PROS',
    speaker: null,
    offsetMs: 1000,
    text: '찬성 입론입니다.',
  },
];

// AI가 같은 문장이나 같은 발언 번호를 두 번 낸 보고서
const duplicatedReport: DebateReport = {
  prosArguments: [
    {
      claim: '같은 주장',
      evidences: [
        { type: 'VAGUE', content: '같은 근거', lineIndex: 0 },
        { type: 'VAGUE', content: '같은 근거', lineIndex: 0 },
      ],
    },
    { claim: '같은 주장', evidences: [] },
  ],
  consArguments: [],
  clashes: [
    {
      title: '같은 쟁점',
      prosPosition: '찬성 입장',
      consPosition: '반대 입장',
      advantage: 'EVEN',
      reason: '근거',
      lineIndices: [0, 0],
    },
    {
      title: '같은 쟁점',
      prosPosition: '찬성 입장',
      consPosition: '반대 입장',
      advantage: 'EVEN',
      reason: '근거',
      lineIndices: [],
    },
  ],
  keyMoments: [],
  teamFeedback: {
    pros: { strengths: ['같은 점', '같은 점'], weaknesses: [] },
    cons: { strengths: [], weaknesses: ['같은 점', '같은 점'] },
  },
};

describe('분석 보고서', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('AI가 같은 문장이나 같은 발언 번호를 두 번 내도 모두 보여주고 key 경고를 내지 않는다', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <ReportView
        report={duplicatedReport}
        lines={lines}
        onJumpToLine={vi.fn()}
      />,
    );

    expect(screen.getAllByText('같은 주장')).toHaveLength(2);
    expect(screen.getAllByText('같은 쟁점')).toHaveLength(2);
    expect(screen.getAllByText('같은 점')).toHaveLength(4);
    const keyWarnings = consoleError.mock.calls.filter((call) =>
      String(call[0]).includes('same key'),
    );
    expect(keyWarnings).toHaveLength(0);
  });
});
