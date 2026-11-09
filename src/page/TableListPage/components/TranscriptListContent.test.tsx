import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ApiUrl } from '../../../apis/endpoints';
import { GetTranscriptsResponseType } from '../../../apis/responses/transcript';
import { server } from '../../../mocks/server';
import TranscriptListContent from './TranscriptListContent';

const transcripts: GetTranscriptsResponseType = {
  transcripts: [
    {
      id: 2,
      tableId: 4,
      tableName: '정기토론',
      agenda: '생성형 AI 사용을 허용해야 한다',
      sttMode: 'SONIOX',
      status: 'PROCESSING',
      refining: true,
      createdAt: '2026-10-23T01:39:15',
    },
    {
      id: 1,
      tableId: 4,
      tableName: null,
      agenda: null,
      sttMode: 'RPC',
      status: 'DONE',
      refining: false,
      createdAt: '2026-10-22T20:10:00',
    },
  ],
};

function LocationProbe() {
  const location = useLocation();
  return <p data-testid="location">{location.pathname}</p>;
}

function renderList(response: GetTranscriptsResponseType = transcripts) {
  server.use(http.get(ApiUrl.transcript, () => HttpResponse.json(response)));
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/?tab=records']}>
        <Routes>
          <Route path="/" element={<TranscriptListContent />} />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('대시보드 토론 기록 목록', () => {
  it('서버가 준 최근 생성순 그대로 토론 기록을 보여준다', async () => {
    renderList();

    const cards = await screen.findAllByRole('link');

    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('생성형 AI 사용을 허용해야 한다');
    expect(cards[0]).toHaveTextContent('10.23');
    expect(cards[1]).toHaveTextContent('10.22');
  });

  it('분석 보고서까지 만들어지지 않은 기록에만 생성 중 태그를 붙인다', async () => {
    renderList();

    const [generating, done] = await screen.findAllByRole('link');

    expect(within(generating).getByText('생성 중')).toBeInTheDocument();
    expect(within(done).queryByText('생성 중')).not.toBeInTheDocument();
  });

  it('시간표가 삭제된 기록은 삭제된 시간표로 표시한다', async () => {
    renderList();

    const [, done] = await screen.findAllByRole('link');

    expect(done).toHaveTextContent('삭제된 시간표');
  });

  it('기록을 누르면 속기록 화면으로 이동한다', async () => {
    const user = userEvent.setup();
    renderList();

    const [generating] = await screen.findAllByRole('link');
    await user.click(generating);

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/table/customize/4/end/transcript/2',
    );
  });

  it('기록이 없으면 안내를 보여준다', async () => {
    renderList({ transcripts: [] });

    expect(
      await screen.findByText('아직 토론 기록이 없어요'),
    ).toBeInTheDocument();
  });

  it('주제 길이나 유무와 상관없이 모든 카드를 시간표 카드와 같은 고정 크기로 보여준다', async () => {
    renderList();

    const cards = await screen.findAllByRole('link');

    cards.forEach((card) => {
      expect(card).toHaveClass('h-[220px]', 'w-[340px]');
    });
  });
});
