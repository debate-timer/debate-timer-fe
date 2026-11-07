import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import TimerPage from './TimerPage';
import { GlobalPortal } from '../../util/GlobalPortal';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ApiUrl } from '../../apis/endpoints';

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

describe('TimerPage - 토론 기록 피쳐 플래그', () => {
  const findTranscribeEntry = () =>
    screen.queryByRole('button', { name: '토론 녹화하기' }) ??
    screen.queryByText('이 브라우저에서는 토론 기록을 사용할 수 없어요');

  const respondFlags = (featureFlags: string[]) =>
    server.use(
      http.get(`${ApiUrl.member}/feature-flags`, () =>
        HttpResponse.json({ featureFlags }),
      ),
    );

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('isVisited', 'true');
    localStorage.setItem('accessToken', 'test-access-token');
  });

  it('플래그가 있는 회원에게 토론 기록 컨트롤을 보여준다', async () => {
    respondFlags(['TRANSCRIPT']);

    renderTimerPage();

    await waitFor(() => expect(findTranscribeEntry()).toBeInTheDocument());
  });

  it('플래그가 없는 회원에게는 토론 기록 컨트롤을 보여주지 않는다', async () => {
    respondFlags([]);

    renderTimerPage();

    await screen.findAllByRole('button');
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(findTranscribeEntry()).not.toBeInTheDocument();
  });
});
