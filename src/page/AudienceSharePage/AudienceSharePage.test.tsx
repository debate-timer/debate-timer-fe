import { act, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { Component, ReactNode } from 'react';
import AudienceSharePage, {
  AudienceShareDisplayError,
} from './AudienceSharePage';
import { useAudienceShareState } from './hooks/useAudienceShareState';
import { AudienceShareError, AudienceShareErrorCode } from './error';

// 모의 (Mock)
vi.mock('./hooks/useAudienceShareState');
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockUseAudienceShareState = vi.mocked(useAudienceShareState);

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
    it('connecting 상태에서는 LoadingSpinner만 표시되고 타이머 조작 요소가 없다', () => {
      mockUseAudienceShareState.mockReturnValue({
        status: 'connecting',
        error: null,
      });
      renderPage('/live/123');

      expect(
        screen.getByRole('status', { name: 'Loading' }),
      ).toBeInTheDocument();
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
        },
      });
      renderPage('/live/123');

      expect(screen.getByText('남은 시간')).toBeInTheDocument();
      expect(screen.getByText('02:00')).toBeInTheDocument();
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
        },
      });
      renderPage('/live/123');

      expect(screen.getByText('00:10')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByText('00:08')).toBeInTheDocument();
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
        },
      });
      renderPage('/live/123');

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByText('00:10')).toBeInTheDocument();
    });

    it('displaying 상태 (TIME_BASED)에서는 AudienceTimeBasedTimer에 올바른 props가 전달된다', () => {
      mockUseAudienceShareState.mockReturnValue({
        status: 'displaying',
        error: null,
        displayData: {
          timerType: 'TIME_BASED',
          currentTeam: 'PROS',
          isRunning: true,
          prosTime: 180,
          consTime: 150,
        },
      });
      renderPage('/live/123');

      expect(screen.getByText('찬성')).toBeInTheDocument();
      expect(screen.getByText('03:00')).toBeInTheDocument();
      expect(screen.getByText('반대')).toBeInTheDocument();
      expect(screen.getByText('02:30')).toBeInTheDocument();
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
        },
      });
      renderPage('/live/123');

      expect(screen.getByText('00:10')).toBeInTheDocument();
      expect(screen.getByText('00:20')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByText('00:08')).toBeInTheDocument();
      expect(screen.getByText('00:20')).toBeInTheDocument();
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
  });

  describe('오류 처리 로직 (AudienceShareDisplayError)', () => {
    const errorMap: Record<AudienceShareErrorCode, string> = {
      SOCKET_URL_UNAVAILABLE: '실시간 연결 주소를 확인할 수 없어요.',
      SOCKET_SERVER_REJECTED: '토론방 연결이 거부되었어요.',
      SOCKET_STOMP_ERROR: '실시간 연결에서 서버 오류가 발생했어요.',
      SOCKET_RETRY_EXHAUSTED: '실시간 연결을 복구하지 못했어요.',
      EVENT_TIMEOUT: '토론 상태를 오래 받지 못했어요.',
      SERVER_ERROR: '서버에서 토론 진행 오류를 전달했어요.',
      UNKNOWN: '알 수 없는 실시간 오류가 발생했어요.',
    };

    it.each(Object.entries(errorMap))(
      '상태 훅에서 %s 오류가 발생하면 번역된 Error를 throw하고 원본 오류를 보존한다',
      (code, expectedMessage) => {
        const sourceError = new AudienceShareError(
          code as AudienceShareErrorCode,
        );
        mockUseAudienceShareState.mockReturnValue({
          status: 'connecting',
          error: sourceError,
        });

        let caughtError: AudienceShareDisplayError | null = null;

        const consoleErrorSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {}); // Error boundary logging 숨김

        renderPage('/live/123', (err) => {
          caughtError = err as AudienceShareDisplayError;
        });

        expect(caughtError).toBeInstanceOf(Error);
        expect(caughtError!.name).toBe('AudienceShareDisplayError');
        expect(caughtError!.message).toBe(expectedMessage);
        expect(caughtError!.sourceError).toBe(sourceError);

        consoleErrorSpy.mockRestore();
      },
    );
  });
});
