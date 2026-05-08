import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import TimerPage from './TimerPage';
import { GlobalPortal } from '../../util/GlobalPortal';

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

describe('TimerPage - 헤더 음소거 아이콘', () => {
  beforeEach(() => {
    localStorage.clear();
    // 첫 방문 모달이 테스트를 방해하지 않도록 방문 기록 설정
    localStorage.setItem('isVisited', 'true');
  });

  it('볼륨이 0보다 클 때 일반 볼륨 아이콘이 표시된다', () => {
    localStorage.setItem('timer-volume', '0.5');
    renderTimerPage();

    expect(screen.queryByTestId('volume-icon-muted')).not.toBeInTheDocument();
    expect(screen.getByTestId('volume-icon-normal')).toBeInTheDocument();
  });

  it('볼륨이 0일 때 음소거 아이콘이 표시된다', () => {
    localStorage.setItem('timer-volume', '0');
    renderTimerPage();

    expect(screen.getByTestId('volume-icon-muted')).toBeInTheDocument();
  });

  it('VolumeBar 음소거 버튼 클릭 시 헤더 아이콘이 즉시 음소거로 변경된다', async () => {
    localStorage.setItem('timer-volume', '0.5');
    renderTimerPage();

    // VolumeBar 열기
    const volumeButton = screen.getByRole('button', { name: '볼륨 조절' });
    await userEvent.click(volumeButton);

    // VolumeBar 음소거 버튼 클릭 (볼륨 > 0이면 title='음소거')
    const muteButton = await screen.findByTitle('음소거');
    await userEvent.click(muteButton);

    await waitFor(() => {
      expect(screen.getByTestId('volume-icon-muted')).toBeInTheDocument();
    });
  });

  it('VolumeBar 슬라이더를 0으로 내리면 헤더 아이콘이 즉시 음소거로 변경된다', async () => {
    localStorage.setItem('timer-volume', '0.5');
    renderTimerPage();

    const volumeButton = screen.getByRole('button', { name: '볼륨 조절' });
    await userEvent.click(volumeButton);

    const slider = await screen.findByRole('slider');
    fireEvent.change(slider, { target: { value: '0' } });

    await waitFor(() => {
      expect(screen.getByTestId('volume-icon-muted')).toBeInTheDocument();
    });
  });

  it('음소거 상태에서 음소거 해제 시 헤더 아이콘이 일반 볼륨으로 복원된다', async () => {
    localStorage.setItem('timer-volume', '0');
    renderTimerPage();

    // VolumeBar 열기
    const volumeButton = screen.getByRole('button', { name: '볼륨 조절' });
    await userEvent.click(volumeButton);

    // 음소거 해제 버튼 클릭 (볼륨 = 0이면 title='음소거 해제')
    const unmuteButton = await screen.findByTitle('음소거 해제');
    await userEvent.click(unmuteButton);

    await waitFor(() => {
      expect(screen.queryByTestId('volume-icon-muted')).not.toBeInTheDocument();
      expect(screen.getByTestId('volume-icon-normal')).toBeInTheDocument();
    });
  });
});
