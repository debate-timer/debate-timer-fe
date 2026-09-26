import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ApiUrl } from '../../apis/endpoints';
import AudienceSharePage from './AudienceSharePage';
import * as useAudienceSocketModule from '../../hooks/sockets/useAudienceSocket';
import { CHAIRMAN_ABSENT_TIMEOUT_MS } from './hooks/useAudienceShareState';
import { GetDebateTableDataForShareResponseType } from '../../apis/responses/live';

// 소켓 연결만 대체하고, 청중 상태 훅과 화면 판단 로직은 실제 코드로 검증한다
vi.mock('../../hooks/sockets/useAudienceSocket');
vi.mock('../../hooks/mutations/useLogout', () => ({
  default: () => ({ mutate: vi.fn() }),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'ko',
      resolvedLanguage: 'ko',
    },
  }),
}));

type AudienceSocketState = ReturnType<typeof useAudienceSocketModule.default>;

const WAITING_MESSAGE = '토론 시작을 대기 중입니다.';
const ABSENT_MESSAGE = '사회자 연결이 끊겼어요. 재접속을 기다리는 중이에요.';

const mockDebateTableData: GetDebateTableDataForShareResponseType = {
  id: 123,
  info: {
    name: '공유 토론 테이블',
    agenda: '공유 토론 주제',
    prosTeamName: '찬성',
    consTeamName: '반대',
  },
  table: [
    {
      stance: 'PROS',
      speechType: '입론',
      bell: null,
      boxType: 'NORMAL',
      time: 180,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: null,
    },
  ],
};

describe('AudienceSharePage 통합 - 청중이 사회자보다 먼저 입장', () => {
  let socketState: AudienceSocketState;

  const setSocketState = (state: Partial<AudienceSocketState>) => {
    socketState = { ...socketState, ...state };
  };

  const renderPage = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const createPage = () => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/live/123']}>
          <Routes>
            <Route path="/live/:id" element={<AudienceSharePage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
    const result = render(createPage());

    return { rerenderPage: () => result.rerender(createPage()) };
  };

  const advance = async (ms: number) => {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  };

  beforeEach(() => {
    vi.useFakeTimers();
    server.use(
      http.get(`${ApiUrl.live}/table/customize/:tableId`, () => {
        return HttpResponse.json(mockDebateTableData);
      }),
    );
    socketState = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      latestMessage: null,
      latestMessageReceivedAt: null,
      lastReceivedAt: null,
      chairmanAbsentAt: null,
      isConnected: true,
      error: null,
    };
    vi.spyOn(useAudienceSocketModule, 'default').mockImplementation(
      () => socketState,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('사회자 부재 알림을 받아도 대기 화면을 유지하다가 사회자가 연결되면 타이머를 표시한다', async () => {
    const { rerenderPage } = renderPage();
    // 테이블 조회(MSW) 응답을 기다린다
    await advance(100);

    // 입장 직후: 토론 대기 화면
    expect(screen.getByText(WAITING_MESSAGE)).toBeInTheDocument();
    expect(screen.getByTestId('audience-waiting-icon')).toBeInTheDocument();

    // 서버가 사회자 부재를 알리고, 부재 판단 시간이 지나도 대기 화면 유지
    setSocketState({ chairmanAbsentAt: Date.now() });
    rerenderPage();
    await advance(CHAIRMAN_ABSENT_TIMEOUT_MS + 5000);

    expect(screen.getByText(WAITING_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(ABSENT_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByTestId('timer-value')).not.toBeInTheDocument();

    // 사회자가 연결되어 SYNC를 보내면 타이머 화면으로 전환
    const receivedAt = Date.now();
    setSocketState({
      latestMessage: {
        eventType: 'SYNC',
        data: {
          timerType: 'NORMAL',
          sequence: 0,
          remainingTime: 120,
          isRunning: false,
        },
        version: 1,
      },
      latestMessageReceivedAt: receivedAt,
      lastReceivedAt: receivedAt,
    });
    rerenderPage();
    await advance(0);

    expect(screen.queryByText(WAITING_MESSAGE)).not.toBeInTheDocument();
    expect(screen.getByTestId('timer-value')).toHaveAttribute(
      'aria-label',
      '02 : 00',
    );
    expect(screen.queryByText(ABSENT_MESSAGE)).not.toBeInTheDocument();
  });

  it('사회자가 한 번 연결된 뒤 부재 알림을 받으면 끊김 안내를 표시한다', async () => {
    const { rerenderPage } = renderPage();
    // 테이블 조회(MSW) 응답을 기다린다
    await advance(100);
    expect(screen.getByText(WAITING_MESSAGE)).toBeInTheDocument();

    const receivedAt = Date.now();
    setSocketState({
      latestMessage: {
        eventType: 'SYNC',
        data: {
          timerType: 'NORMAL',
          sequence: 0,
          remainingTime: 120,
          isRunning: false,
        },
        version: 1,
      },
      latestMessageReceivedAt: receivedAt,
      lastReceivedAt: receivedAt,
    });
    rerenderPage();
    await advance(0);
    expect(screen.getByTestId('timer-value')).toBeInTheDocument();

    await advance(1000);
    setSocketState({ chairmanAbsentAt: Date.now() });
    rerenderPage();
    await advance(0);

    expect(screen.getByText(ABSENT_MESSAGE)).toBeInTheDocument();
    expect(screen.getByTestId('timer-value')).toBeInTheDocument();
  });
});
