import { useCallback, useRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import TimerPage from './TimerPage';
import { GlobalPortal } from '../../util/GlobalPortal';

// 소켓 연결 없이 공유 모달 열고 닫기만 검증하기 위해 라이브 공유 훅을 대체한다
vi.mock('./hooks/useLiveShare', () => ({
  useLiveShare: () => {
    const [isLiveShareModalOpen, setIsLiveShareModalOpen] = useState(false);
    const toggleLiveShareModal = useCallback(() => {
      setIsLiveShareModalOpen((prev) => !prev);
    }, []);
    const liveShareModalRef = useRef<HTMLDivElement>(null);

    return {
      isLiveShareModalOpen,
      toggleLiveShareModal,
      liveShareModalRef,
      issueEvent: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      shareUrl: 'https://example.com/live/5',
      isLoading: false,
      isError: false,
      errorType: 'else',
      isSocketConnected: false,
      restartLiveShare: vi.fn(),
    };
  },
}));

vi.mock('qrcode.react', () => ({
  QRCodeSVG: () => <svg aria-label="qr-code" />,
}));

function renderTimerPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <GlobalPortal.Provider>
        <MemoryRouter initialEntries={['/timer/5']}>
          <Routes>
            <Route path="/timer/:id" element={<TimerPage />} />
          </Routes>
        </MemoryRouter>
      </GlobalPortal.Provider>
    </QueryClientProvider>,
  );
}

describe('TimerPage - 라이브 공유 모달', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('isVisited', 'true');
    localStorage.setItem('accessToken', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('공유 버튼과 모달 영역은 타이머보다 위 레이어에 놓인다', async () => {
    renderTimerPage();

    const shareButton = await screen.findByRole('button', {
      name: '라이브 공유',
    });

    expect(shareButton.parentElement).toHaveClass('z-20');
  });

  it('공유 모달은 뒤의 타이머가 비치지 않도록 불투명한 배경을 가진다', async () => {
    const user = userEvent.setup();
    renderTimerPage();

    await user.click(
      await screen.findByRole('button', { name: '라이브 공유' }),
    );

    expect(screen.getByTestId('live-share-modal')).toHaveClass(
      'bg-default-white',
    );
  });

  it('공유 모달의 닫기 버튼을 누르면 모달이 닫히고 공유 버튼이 다시 보인다', async () => {
    const user = userEvent.setup();
    renderTimerPage();

    await user.click(
      await screen.findByRole('button', { name: '라이브 공유' }),
    );
    expect(screen.getByTestId('live-share-modal')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '모달 닫기' }));

    expect(screen.queryByTestId('live-share-modal')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '라이브 공유' }),
    ).toBeInTheDocument();
  });
});
