import GlobalSettingsProvider from '../../components/GlobalSettingsProvider/GlobalSettingsProvider';
import { useState } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import TimerPage from './TimerPage';
import { GlobalPortal } from '../../util/GlobalPortal';

const START = vi.hoisted(() => vi.fn());
const STOP = vi.hoisted(() => vi.fn());
const ISSUE = vi.hoisted(() => vi.fn(() => true));
vi.mock('./hooks/useLiveShareSession', () => ({
  default: function useMockLiveShareSession() {
    const [isSharing, setIsSharing] = useState(false);
    return {
      startSharing: () => {
        START();
        setIsSharing(true);
      },
      stopSharing: () => {
        STOP();
        setIsSharing(false);
        return true;
      },
      issueEvent: ISSUE,
      shareUrl: 'https://example.com/live/5',
      isSharing,
      isSocketConnected: isSharing,
      isLoading: false,
      isError: false,
      hasStopError: false,
      errorType: 'else',
      restartLiveShare: vi.fn(),
    };
  },
}));

function renderTimerPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createMemoryRouter(
    [{ path: '/table/customize/:id', element: <TimerPage /> }],
    { initialEntries: ['/table/customize/5'] },
  );
  return render(
    <QueryClientProvider client={queryClient}>
      <GlobalSettingsProvider>
        <GlobalPortal.Provider>
          <RouterProvider router={router} />
        </GlobalPortal.Provider>
      </GlobalSettingsProvider>
    </QueryClientProvider>,
  );
}

describe('타이머와 명시적 공유의 연결', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('isVisited', 'true');
    localStorage.setItem('accessToken', 'test-token');
    localStorage.setItem('memberId', '1');
  });
  afterEach(() => {
    localStorage.clear();
  });
  it('메뉴 열기와 공유 확인 취소는 공유를 시작하지 않는다', async () => {
    const user = userEvent.setup();
    renderTimerPage();
    await user.click(await screen.findByRole('button', { name: '토론 메뉴' }));
    expect(START).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '실시간 공유' }));
    expect(
      screen.getByRole('dialog', { name: '실시간 공유를 시작할까요?' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(START).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '실시간 공유' })).toHaveFocus();
  });
  it('메뉴를 닫아도 공유와 타이머는 유지하고 공유 끄기는 타이머를 정지하지 않는다', async () => {
    const user = userEvent.setup();
    renderTimerPage();
    await screen.findAllByRole('button', { name: '재생' });
    fireEvent.keyDown(window, { code: 'Space' });
    await screen.findByRole('button', { name: '일시정지' });
    await user.click(screen.getByRole('button', { name: '토론 메뉴' }));
    await user.click(screen.getByRole('button', { name: '실시간 공유' }));
    await user.click(screen.getByRole('button', { name: '공유 시작' }));
    expect(START).toHaveBeenCalledTimes(1);
    await user.keyboard('{Escape}');
    expect(
      screen.getByRole('button', { name: '일시정지' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '토론 메뉴' }));
    expect(screen.getByRole('button', { name: '실시간 공유' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(screen.getByRole('button', { name: '실시간 공유' }));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(STOP).toHaveBeenCalledTimes(1));
    expect(
      screen.getByRole('button', { name: '일시정지' }),
    ).toBeInTheDocument();
  });
});
