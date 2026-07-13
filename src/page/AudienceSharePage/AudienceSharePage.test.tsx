import { act, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { Component, ReactNode } from 'react';
import AudienceSharePage from './AudienceSharePage';
import { useAudienceShareState } from './hooks/useAudienceShareState';
import { AudienceShareError } from './error';
import { useGetDebateTableDataForShare } from '../../hooks/query/useGetDebateTableDataForShare';
import { GetDebateTableDataForShareResponseType } from '../../apis/responses/live';

// 모의 (Mock)
vi.mock('./hooks/useAudienceShareState');
vi.mock('../../hooks/query/useGetDebateTableDataForShare');
vi.mock('../../hooks/mutations/useLogout', () => ({
  default: () => ({ mutate: vi.fn() }),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, string>) =>
      Object.entries(values ?? {}).reduce(
        (translated, [name, value]) => translated.replace(`{{${name}}}`, value),
        key,
      ),
    i18n: {
      language: 'ko',
      resolvedLanguage: 'ko',
    },
  }),
}));

const mockUseAudienceShareState = vi.mocked(useAudienceShareState);
const mockUseGetDebateTableDataForShare = vi.mocked(
  useGetDebateTableDataForShare,
);

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
    {
      stance: 'CONS',
      speechType: '반론',
      bell: null,
      boxType: 'NORMAL',
      time: 90,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: '이토론',
    },
    {
      stance: 'NEUTRAL',
      speechType: '자유토론',
      bell: null,
      boxType: 'TIME_BASED',
      time: null,
      timePerTeam: 180,
      timePerSpeaking: 30,
      speaker: null,
    },
  ],
};

type ShareQueryResult = ReturnType<typeof useGetDebateTableDataForShare>;

function setQueryState(
  state: Partial<ShareQueryResult> &
    Pick<ShareQueryResult, 'isError' | 'isLoading' | 'isSuccess'>,
) {
  mockUseGetDebateTableDataForShare.mockReturnValue({
    data: undefined,
    error: null,
    ...state,
  } as ShareQueryResult);
}

class TestErrorBoundary extends Component<
  { children: ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onError: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return <div>Error Caught</div>;
    }
    return this.props.children;
  }
}

describe('AudienceSharePage', () => {
  const renderPage = (
    initialRoute: string,
    onError: (error: Error) => void = () => {},
  ) => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <TestErrorBoundary onError={onError}>
          <Routes>
            <Route path="/live/:id" element={<AudienceSharePage />} />
          </Routes>
        </TestErrorBoundary>
      </MemoryRouter>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setQueryState({
      data: mockDebateTableData,
      isError: false,
      isLoading: false,
      isSuccess: true,
    });
    mockUseAudienceShareState.mockReturnValue({
      status: 'connecting',
      error: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('ID Validation', () => {
    it.each([
      ['/live/abc', 'abc'],
      ['/live/-1', '-1'],
      ['/live/0', '0'],
      ['/live/1.5', '1.5'],
    ])('유효하지 않은 ID(%s)는 번역된 Error를 throw한다', (route) => {
      let caughtError: Error | null = null;

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {}); // Error boundary logging 숨김

      renderPage(route, (err) => {
        caughtError = err;
      });

      expect(caughtError).toBeInstanceOf(Error);
      expect(caughtError!.message).toBe('유효하지 않은 토론방 ID입니다.');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('상태별 화면 렌더링', () => {
    it('API 조회 중에는 소켓 연결을 비활성화하고 회색 스피너만 표시한다', () => {
      setQueryState({
        isError: false,
        isLoading: true,
        isSuccess: false,
      });

      renderPage('/live/123');

      expect(mockUseAudienceShareState).toHaveBeenCalledWith(123, {
        enabled: false,
        table: undefined,
      });
      expect(screen.getByRole('status', { name: 'Loading' })).toHaveClass(
        'text-gray-500',
      );
      expect(screen.queryByText('공유 토론 테이블')).not.toBeInTheDocument();
    });

    it('connecting 상태에서는 LoadingSpinner만 표시되고 타이머 조작 요소가 없다', () => {
      mockUseAudienceShareState.mockReturnValue({
        status: 'connecting',
        error: null,
      });
      renderPage('/live/123');

      expect(mockUseAudienceShareState).toHaveBeenCalledWith(123, {
        enabled: true,
        table: mockDebateTableData.table,
      });
      expect(
        screen.getByRole('status', { name: 'Loading' }),
      ).toBeInTheDocument();
      expect(screen.queryByText('공유 토론 테이블')).not.toBeInTheDocument();
      // 타이머 요소 없는지 확인
      expect(screen.queryByText('남은 시간')).not.toBeInTheDocument();
      expect(screen.queryByText('찬성')).not.toBeInTheDocument();
    });

    it('waiting 상태에서는 서버 데이터 대기 번역 문구가 표시된다', () => {
      mockUseAudienceShareState.mockReturnValue({
        status: 'waiting',
        error: null,
      });
      renderPage('/live/123');

      expect(
        screen.getByText('토론 시작을 대기 중입니다.'),
      ).toBeInTheDocument();
      expect(screen.getByText('공유 토론 테이블')).toBeInTheDocument();
      expect(screen.getByText('공유 토론 주제')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '언어 선택' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '홈으로 이동' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '로그인' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: '도움말' }),
      ).not.toBeInTheDocument();
    });

    it('테이블 이름과 주제가 공백이면 TimerPage와 같은 대체 문구를 표시한다', () => {
      setQueryState({
        data: {
          ...mockDebateTableData,
          info: {
            ...mockDebateTableData.info,
            name: '   ',
            agenda: '',
          },
        },
        isError: false,
        isLoading: false,
        isSuccess: true,
      });
      mockUseAudienceShareState.mockReturnValue({
        status: 'waiting',
        error: null,
      });

      renderPage('/live/123');

      expect(screen.getByText('테이블 이름 없음')).toBeInTheDocument();
      expect(screen.getByText('주제 없음')).toBeInTheDocument();
    });

    it('displaying 상태 (NORMAL)에서는 AudienceNormalTimer에 올바른 props가 전달된다', () => {
      mockUseAudienceShareState.mockReturnValue({
        status: 'displaying',
        error: null,
        displayData: {
          timerType: 'NORMAL',
          currentTeam: null,
          isRunning: true,
          singleTime: 120,
          sequence: 0,
        },
      });
      renderPage('/live/123');

      expect(screen.getByText('입론')).toBeInTheDocument();
      expect(screen.getByText('찬성 팀')).toBeInTheDocument();
      expect(screen.getByText('토론자 없음')).toBeInTheDocument();
      expect(screen.getByTestId('timer-value')).toHaveAttribute(
        'aria-label',
        '02 : 00',
      );
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuenow',
        '33.33333333333333',
      );
    });

    it('NORMAL sequence의 CONS 항목에 반대 팀 정보를 연결한다', () => {
      mockUseAudienceShareState.mockReturnValue({
        status: 'displaying',
        error: null,
        displayData: {
          timerType: 'NORMAL',
          currentTeam: null,
          isRunning: false,
          singleTime: 45,
          sequence: 1,
        },
      });

      renderPage('/live/123');

      expect(screen.getByText('반론')).toBeInTheDocument();
      expect(screen.getByText('반대 팀')).toBeInTheDocument();
      expect(screen.getByText('이토론 토론자')).toBeInTheDocument();
      expect(screen.getByTestId('timer-progress-fill')).toHaveClass(
        'bg-camp-red',
      );
    });

    it('PLAY 상태의 NORMAL 타이머는 화면에서 로컬 카운트다운을 진행한다', () => {
      vi.useFakeTimers();
      mockUseAudienceShareState.mockReturnValue({
        status: 'displaying',
        error: null,
        displayData: {
          timerType: 'NORMAL',
          currentTeam: null,
          isRunning: true,
          singleTime: 10,
          sequence: 0,
        },
      });
      renderPage('/live/123');

      expect(screen.getByTestId('timer-value')).toHaveAttribute(
        'aria-label',
        '00 : 10',
      );

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByTestId('timer-value')).toHaveAttribute(
        'aria-label',
        '00 : 08',
      );
    });

    it('정지 상태의 NORMAL 타이머는 수신된 시간을 유지한다', () => {
      vi.useFakeTimers();
      mockUseAudienceShareState.mockReturnValue({
        status: 'displaying',
        error: null,
        displayData: {
          timerType: 'NORMAL',
          currentTeam: null,
          isRunning: false,
          singleTime: 10,
          sequence: 0,
        },
      });
      renderPage('/live/123');

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByTestId('timer-value')).toHaveAttribute(
        'aria-label',
        '00 : 10',
      );
    });

    it('displaying 상태 (TIME_BASED)에서는 AudienceTimeBasedTimer에 올바른 props가 전달된다', () => {
      mockUseAudienceShareState.mockReturnValue({
        status: 'displaying',
        error: null,
        displayData: {
          timerType: 'TIME_BASED',
          currentTeam: 'PROS',
          isRunning: true,
          prosTime: 20,
          consTime: null,
          sequence: 2,
          eventType: 'PLAY',
          revision: 1,
        },
      });
      renderPage('/live/123');

      expect(screen.getByText('찬성 팀')).toBeInTheDocument();
      expect(screen.getByText('반대 팀')).toBeInTheDocument();
      expect(screen.getByTestId('pros-total-timer')).toHaveAttribute(
        'aria-label',
        '03 : 00',
      );
      expect(screen.getByTestId('pros-current-timer')).toHaveAttribute(
        'aria-label',
        '00 : 20',
      );
    });

    it('PLAY 상태의 TIME_BASED 타이머는 현재 발언 팀만 로컬 카운트다운을 진행한다', () => {
      vi.useFakeTimers();
      mockUseAudienceShareState.mockReturnValue({
        status: 'displaying',
        error: null,
        displayData: {
          timerType: 'TIME_BASED',
          currentTeam: 'PROS',
          isRunning: true,
          prosTime: 10,
          consTime: 20,
          sequence: 2,
          eventType: 'PLAY',
          revision: 1,
        },
      });
      renderPage('/live/123');

      expect(screen.getByTestId('pros-current-timer')).toHaveAttribute(
        'aria-label',
        '00 : 10',
      );
      expect(screen.getByTestId('cons-current-timer')).toHaveAttribute(
        'aria-label',
        '00 : 30',
      );

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByTestId('pros-current-timer')).toHaveAttribute(
        'aria-label',
        '00 : 08',
      );
      expect(screen.getByTestId('cons-current-timer')).toHaveAttribute(
        'aria-label',
        '00 : 30',
      );
    });

    it('finished 상태에서는 종료 문구와 페이지 닫기 버튼이 표시되며 클릭 시 window.close를 호출한다', async () => {
      mockUseAudienceShareState.mockReturnValue({
        status: 'finished',
        error: null,
      });

      const windowCloseSpy = vi
        .spyOn(window, 'close')
        .mockImplementation(() => {});
      const user = userEvent.setup();

      renderPage('/live/123');

      expect(screen.getByText('토론이 종료되었습니다.')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: '페이지 닫기' });
      expect(closeButton).toBeInTheDocument();

      await user.click(closeButton);

      expect(windowCloseSpy).toHaveBeenCalled();

      // 상태 변경이나 홈 이동이 없어야 함
      expect(screen.getByText('토론이 종료되었습니다.')).toBeInTheDocument();
    });

    it.each([
      {
        name: '배열 범위를 벗어난 sequence',
        sequence: 10,
        table: mockDebateTableData.table,
      },
      {
        name: 'TIME_BASED API 항목',
        sequence: 0,
        table: [
          {
            ...mockDebateTableData.table[0],
            boxType: 'TIME_BASED' as const,
            time: null,
            timePerTeam: 60,
          },
        ],
      },
      {
        name: '0초 NORMAL API 항목',
        sequence: 0,
        table: [{ ...mockDebateTableData.table[0], time: 0 }],
      },
    ])('$name이면 서버 연결 오류 UI를 표시한다', ({ sequence, table }) => {
      setQueryState({
        data: { ...mockDebateTableData, table },
        isError: false,
        isLoading: false,
        isSuccess: true,
      });
      mockUseAudienceShareState.mockReturnValue({
        status: 'displaying',
        error: null,
        displayData: {
          timerType: 'NORMAL',
          currentTeam: null,
          isRunning: false,
          singleTime: 30,
          sequence,
        },
      });

      renderPage('/live/123');

      expect(screen.getByText('서버 연결에 실패했어요.')).toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('NEUTRAL NORMAL 항목은 중립 진행 바로 타이머를 표시한다', () => {
      setQueryState({
        data: {
          ...mockDebateTableData,
          table: [
            {
              ...mockDebateTableData.table[0],
              stance: 'NEUTRAL',
              time: 60,
            },
          ],
        },
        isError: false,
        isLoading: false,
        isSuccess: true,
      });
      mockUseAudienceShareState.mockReturnValue({
        status: 'displaying',
        error: null,
        displayData: {
          timerType: 'NORMAL',
          currentTeam: null,
          isRunning: false,
          singleTime: 30,
          sequence: 0,
        },
      });

      renderPage('/live/123');

      expect(screen.queryByTestId('participant-row')).not.toBeInTheDocument();
      expect(screen.getByTestId('timer-progress-fill')).toHaveClass(
        'bg-default-neutral',
      );
    });
  });

  describe('오류 처리', () => {
    it('API 조회에 실패하면 페이지 중앙에 데이터 오류와 새로고침 버튼을 표시한다', () => {
      setQueryState({
        error: new Error('API failure'),
        isError: true,
        isLoading: false,
        isSuccess: false,
      });

      renderPage('/live/123');

      expect(
        screen.getByText(
          '필요한 데이터를 불러오지 못했어요. 다시 시도해보세요.',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('audience-share-error-icon'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '새로고침' }),
      ).toBeInTheDocument();
      expect(screen.queryByText('공유 토론 테이블')).not.toBeInTheDocument();
    });

    it('소켓 연결에 실패하면 페이지 중앙에 서버 연결 오류를 표시한다', () => {
      mockUseAudienceShareState.mockReturnValue({
        status: 'connecting',
        error: new AudienceShareError('SOCKET_STOMP_ERROR'),
      });

      renderPage('/live/123');

      expect(screen.getByText('서버 연결에 실패했어요.')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '새로고침' }),
      ).toBeInTheDocument();
    });

    it('API와 소켓 오류가 함께 있으면 소켓 오류를 우선 표시한다', () => {
      setQueryState({
        error: new Error('API failure'),
        isError: true,
        isLoading: false,
        isSuccess: false,
      });
      mockUseAudienceShareState.mockReturnValue({
        status: 'connecting',
        error: new AudienceShareError('SOCKET_STOMP_ERROR'),
      });

      renderPage('/live/123');

      expect(screen.getByText('서버 연결에 실패했어요.')).toBeInTheDocument();
      expect(
        screen.queryByText(
          '필요한 데이터를 불러오지 못했어요. 다시 시도해보세요.',
        ),
      ).not.toBeInTheDocument();
    });
  });
});
