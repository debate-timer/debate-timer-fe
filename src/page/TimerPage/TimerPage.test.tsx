import GlobalSettingsProvider from '../../components/GlobalSettingsProvider/GlobalSettingsProvider';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import TimerPage from './TimerPage';
import { GlobalPortal } from '../../util/GlobalPortal';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ApiUrl } from '../../apis/endpoints';

function renderTimerPage(id = '5') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  // 타이머 화면은 useBlocker를 쓰므로 data router로 감싼다.
  const router = createMemoryRouter(
    [{ path: '/table/customize/:id', element: <TimerPage /> }],
    { initialEntries: [`/table/customize/${id}`] },
  );
  const view = render(
    <QueryClientProvider client={queryClient}>
      <GlobalSettingsProvider>
        <GlobalPortal.Provider>
          <RouterProvider router={router} />
        </GlobalPortal.Provider>
      </GlobalSettingsProvider>
    </QueryClientProvider>,
  );
  return { ...view, queryClient };
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

describe('기본 타이머의 토론 메뉴 연결', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('isVisited', 'true');
    localStorage.setItem('accessToken', 'test-access-token');
    localStorage.setItem('memberId', '1');
  });
  it('자동 녹음 동의 없이 메뉴와 세 기능 상태를 표시한다', async () => {
    const user = userEvent.setup();
    renderTimerPage();
    await screen.findByRole('button', { name: '토론 메뉴' });
    expect(
      screen.getByRole('list', { name: '토론 기능 상태' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('토론 음성 기록에 동의하시나요?'),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '토론 메뉴' }));
    expect(
      screen.getByRole('dialog', { name: '토론 메뉴' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '답변 시간' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(screen.getByRole('button', { name: '답변 시간' }));
    expect(screen.getByRole('button', { name: '답변 시간' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: '토론 메뉴' })).toHaveFocus();
  });
  it('권한 없는 회원에게 속기 실행 불가 이유를 제공한다', async () => {
    server.use(
      http.get(`${ApiUrl.member}/feature-flags`, () =>
        HttpResponse.json({ featureFlags: [] }),
      ),
    );
    const user = userEvent.setup();
    renderTimerPage();
    await user.click(await screen.findByRole('button', { name: '토론 메뉴' }));
    expect(screen.getByRole('button', { name: '속기록' })).toBeDisabled();
    expect(
      screen.getByText('사용 권한이 필요한 기능입니다.'),
    ).toBeInTheDocument();
  });
});

describe('타이머 종료·로그아웃 화면 연결', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('isVisited', 'true');
  });
  it('게스트 종료 안내를 취소해도 주 타이머는 정지를 유지한다', async () => {
    sessionStorage.setItem(
      'DebateTableData',
      JSON.stringify({
        id: -1,
        info: {
          name: '게스트',
          agenda: '주제',
          prosTeamName: '찬성',
          consTeamName: '반대',
        },
        table: [
          {
            boxType: 'NORMAL',
            stance: 'PROS',
            speechType: '입론',
            speaker: null,
            bell: null,
            time: 60,
            timePerTeam: null,
            timePerSpeaking: null,
          },
        ],
      }),
    );
    const user = userEvent.setup();
    renderTimerPage('guest');
    await user.click(await screen.findByRole('button', { name: '재생' }));
    expect(
      screen.getByRole('button', { name: '일시정지' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '토론 종료' }));
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '재생' })).toBeInTheDocument();
  });
  it('로그아웃 취소는 실행을 유지하고 실패 확인 후에는 인증과 중단 상태를 유지한다', async () => {
    localStorage.setItem('accessToken', 'member');
    localStorage.setItem('memberId', '1');
    let logoutRequests = 0;
    server.use(
      http.post(`${ApiUrl.member}/logout`, () => {
        logoutRequests += 1;
        return new HttpResponse(null, { status: 500 });
      }),
    );
    const user = userEvent.setup();
    renderTimerPage();
    await screen.findAllByRole('button', { name: '재생' });
    fireEvent.keyDown(window, { code: 'Space' });
    await screen.findByRole('button', { name: '일시정지' });
    await user.click(screen.getByRole('button', { name: '설정' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '로그아웃',
      }),
    );
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: '취소',
      }),
    );
    expect(
      screen.getByRole('button', { name: '일시정지' }),
    ).toBeInTheDocument();
    expect(logoutRequests).toBe(0);
    await user.click(screen.getByRole('button', { name: '설정' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: '로그아웃',
      }),
    );
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: '로그아웃',
      }),
    );
    await screen.findByRole('alert');
    expect(logoutRequests).toBe(1);
    expect(localStorage.getItem('accessToken')).toBe('member');
    expect(
      screen.queryByRole('button', { name: '일시정지' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '토론 메뉴' })).toBeDisabled();
  });
});
