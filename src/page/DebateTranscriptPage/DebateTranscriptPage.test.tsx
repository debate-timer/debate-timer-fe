import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { server } from '../../mocks/server';
import { ApiUrl } from '../../apis/endpoints';
import { GetTranscriptResponseType } from '../../apis/responses/transcript';
import { GlobalPortal } from '../../util/GlobalPortal';
import DebateTranscriptPage from './DebateTranscriptPage';

const doneTranscript: GetTranscriptResponseType = {
  id: 9,
  tableId: 1,
  tableName: '정기토론',
  agenda: '노동시장 유연화를 확대해야 한다',
  prosTeamName: '찬성',
  consTeamName: '반대',
  status: 'DONE',
  sttMode: 'RPC',
  refining: false,
  lines: [
    {
      index: 0,
      timeBoxIndex: 0,
      speechType: '입론',
      stance: 'PROS',
      speaker: '콜리',
      offsetMs: 4000,
      text: '정규직 과보호가 채용을 막습니다',
    },
    {
      index: 1,
      timeBoxIndex: 1,
      speechType: '입론',
      stance: 'CONS',
      speaker: null,
      offsetMs: 65000,
      text: '채용은 경기가 결정합니다',
    },
  ],
  report: {
    prosArguments: [
      {
        claim: '과보호가 채용을 막는다',
        evidences: [{ type: 'VAGUE', content: '출처 없는 설문', lineIndex: 0 }],
      },
    ],
    consArguments: [],
    clashes: [
      {
        title: '해고 완화가 채용을 늘리는가',
        prosPosition: '늘린다',
        consPosition: '경기가 결정한다',
        advantage: 'CONS',
        reason: '인과 근거 부족',
        lineIndices: [0, 1],
      },
    ],
    keyMoments: [
      { lineIndex: 1, label: '흐름 전환', reason: '인과를 정면 반박' },
    ],
    teamFeedback: {
      pros: { strengths: ['구조가 명확함'], weaknesses: ['출처 부족'] },
      cons: { strengths: ['일관된 공략'], weaknesses: ['대안 부족'] },
    },
  },
  errorMessage: null,
};

function renderPage(transcript: GetTranscriptResponseType) {
  server.use(
    http.get(`${ApiUrl.transcript}/:transcriptId`, () =>
      HttpResponse.json(transcript),
    ),
  );
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <GlobalPortal.Provider>
        <MemoryRouter initialEntries={['/table/customize/1/end/transcript/9']}>
          <Routes>
            <Route
              path="/table/customize/:tableId/end/transcript/:transcriptId"
              element={<DebateTranscriptPage />}
            />
          </Routes>
        </MemoryRouter>
      </GlobalPortal.Provider>
    </QueryClientProvider>,
  );
}

describe('토론 속기록 화면', () => {
  it('화자가 구분된 속기록을 보여준다', async () => {
    renderPage(doneTranscript);

    expect(
      await screen.findByText('정규직 과보호가 채용을 막습니다'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('01:05').length).toBeGreaterThan(0);
    expect(screen.getByText('콜리')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '속기록' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it.each([
    ['RPC', '음성 인식: 실시간 인식 (크롬)'],
    ['SONIOX', '음성 인식: 발언 후 일괄 인식 (Soniox)'],
  ] as const)(
    '%s 모드로 기록한 속기록이면 인식 방식을 보여준다',
    async (sttMode, label) => {
      renderPage({ ...doneTranscript, sttMode });

      expect(await screen.findByText(label)).toBeInTheDocument();
    },
  );

  it('분석 보고서 탭에서 주장과 근거, 충돌 쟁점, 팀별 피드백을 보여준다', async () => {
    const user = userEvent.setup();
    renderPage(doneTranscript);

    await user.click(await screen.findByRole('tab', { name: '분석 보고서' }));

    expect(screen.getByText('과보호가 채용을 막는다')).toBeInTheDocument();
    expect(screen.getByText('출처 불명확')).toBeInTheDocument();
    expect(screen.getByText('해고 완화가 채용을 늘리는가')).toBeInTheDocument();
    expect(screen.getByText('구조가 명확함')).toBeInTheDocument();
  });

  it('큰 역할을 한 발언을 누르면 속기록 탭으로 이동한다', async () => {
    const user = userEvent.setup();
    renderPage(doneTranscript);
    await user.click(await screen.findByRole('tab', { name: '분석 보고서' }));

    await user.click(screen.getByRole('button', { name: /흐름 전환/ }));

    expect(screen.getByRole('tab', { name: '속기록' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  describe('기록을 만드는 중', () => {
    const stepState = (name: string) =>
      screen.getByRole('listitem', { name: new RegExp(name) }).dataset.state;

    it('속기록을 보정하는 중이면 속기록·보고서 대신 진행 단계를 보여준다', async () => {
      renderPage({
        ...doneTranscript,
        status: 'PROCESSING',
        refining: true,
        report: null,
      });

      expect(
        await screen.findByText('토론 기록을 만들고 있어요'),
      ).toBeInTheDocument();
      expect(stepState('속기록 보정 중')).toBe('active');
      expect(
        screen.getByRole('link', { name: '토론 기록으로 가기' }),
      ).toHaveAttribute('href', '/?tab=records');
      expect(stepState('분석 보고서 발행 중')).toBe('waiting');
      expect(screen.queryByRole('tab')).not.toBeInTheDocument();
      expect(
        screen.queryByText('정규직 과보호가 채용을 막습니다'),
      ).not.toBeInTheDocument();
    });

    it('보정이 끝나고 분석 중이면 보정 단계를 완료로, 보고서 단계를 진행 중으로 보여준다', async () => {
      renderPage({ ...doneTranscript, status: 'PROCESSING', report: null });

      await screen.findByText('토론 기록을 만들고 있어요');

      expect(stepState('속기록 보정 중')).toBe('done');
      expect(stepState('분석 보고서 발행 중')).toBe('active');
      expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    });
  });

  it('분석에 실패하면 실패 사유를 보여준다', async () => {
    const user = userEvent.setup();
    renderPage({
      ...doneTranscript,
      status: 'FAILED',
      report: null,
      errorMessage: 'OpenAI API 키가 설정되지 않았습니다.',
    });

    await user.click(await screen.findByRole('tab', { name: '분석 보고서' }));

    expect(
      screen.getByText('분석 보고서를 만들지 못했어요'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('OpenAI API 키가 설정되지 않았습니다.'),
    ).toBeInTheDocument();
  });
});
