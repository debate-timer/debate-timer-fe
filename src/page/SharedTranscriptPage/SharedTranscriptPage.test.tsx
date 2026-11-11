import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { server } from '../../mocks/server';
import { ApiUrl } from '../../apis/endpoints';
import { GetSharedTranscriptResponseType } from '../../apis/responses/transcript';
import { GlobalPortal } from '../../util/GlobalPortal';
import SharedTranscriptPage from './SharedTranscriptPage';

const sharedTranscript: GetSharedTranscriptResponseType = {
  tableName: '정기토론',
  agenda: '노동시장 유연화를 확대해야 한다',
  prosTeamName: '찬성',
  consTeamName: '반대',
  status: 'DONE',
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
  ],
  report: {
    prosArguments: [
      {
        claim: '과보호가 채용을 막는다',
        evidences: [{ type: 'VAGUE', content: '출처 없는 설문', lineIndex: 0 }],
      },
    ],
    consArguments: [],
    clashes: [],
    keyMoments: [],
    teamFeedback: {
      pros: { strengths: ['구조가 명확함'], weaknesses: ['출처 부족'] },
      cons: { strengths: ['일관된 공략'], weaknesses: ['대안 부족'] },
    },
  },
};

function renderPage(
  resolver: () => Response | Promise<Response> = () =>
    HttpResponse.json(sharedTranscript),
) {
  let requestedToken: string | undefined;
  server.use(
    http.get(`${ApiUrl.sharedTranscript}/:shareToken`, ({ params }) => {
      requestedToken = String(params.shareToken);
      return resolver();
    }),
  );
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <GlobalPortal.Provider>
        <MemoryRouter initialEntries={['/transcript/shared/share-token']}>
          <Routes>
            <Route
              path="/transcript/shared/:shareToken"
              element={<SharedTranscriptPage />}
            />
          </Routes>
        </MemoryRouter>
      </GlobalPortal.Provider>
    </QueryClientProvider>,
  );
  return { getRequestedToken: () => requestedToken };
}

describe('공유받은 토론 기록 화면', () => {
  it('공유 토큰으로 속기록을 불러와 보여준다', async () => {
    const { getRequestedToken } = renderPage();

    expect(
      await screen.findByText('정규직 과보호가 채용을 막습니다'),
    ).toBeInTheDocument();
    expect(getRequestedToken()).toBe('share-token');
    expect(
      screen.getByText('노동시장 유연화를 확대해야 한다'),
    ).toBeInTheDocument();
  });

  it('분석 보고서 탭에서 보고서를 볼 수 있다', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole('tab', { name: '분석 보고서' }));

    expect(screen.getByText('과보호가 채용을 막는다')).toBeInTheDocument();
  });

  it('공유한 사람만 쓰는 공유 버튼은 보여주지 않는다', async () => {
    renderPage();

    await screen.findByText('정규직 과보호가 채용을 막습니다');

    expect(
      screen.queryByRole('button', { name: '공유하기' }),
    ).not.toBeInTheDocument();
  });

  it('기록을 만드는 중이면 진행 단계를 보여주고 대시보드 링크는 숨긴다', async () => {
    renderPage(() =>
      HttpResponse.json({
        ...sharedTranscript,
        status: 'PROCESSING',
        refining: true,
        report: null,
      }),
    );

    expect(
      await screen.findByText('토론 기록을 만들고 있어요'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: '토론 기록으로 가기' }),
    ).not.toBeInTheDocument();
  });

  it('공유가 중지됐거나 없는 링크면 안내 문구를 보여준다', async () => {
    renderPage(() => HttpResponse.json({}, { status: 404 }));

    expect(
      await screen.findByText(/공유가 중지됐거나 잘못된 링크/),
    ).toBeInTheDocument();
  });

  it('생성 중에 공유가 중지되면 이전 내용을 숨기고 안내 문구를 보여준다', async () => {
    let requestCount = 0;
    renderPage(() => {
      requestCount += 1;
      return requestCount === 1
        ? HttpResponse.json({
            ...sharedTranscript,
            status: 'PROCESSING',
            report: null,
          })
        : HttpResponse.json({}, { status: 404 });
    });
    await screen.findByText('토론 기록을 만들고 있어요');

    expect(
      await screen.findByText(
        /공유가 중지됐거나 잘못된 링크/,
        {},
        { timeout: 4000 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('토론 기록을 만들고 있어요'),
    ).not.toBeInTheDocument();
  });
});
