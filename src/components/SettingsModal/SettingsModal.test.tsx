import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ApiUrl } from '../../apis/endpoints';
import { setAccessToken, setMemberId } from '../../util/accessToken';
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import SettingsModal from './SettingsModal';
import GlobalSettingsProvider from '../GlobalSettingsProvider/GlobalSettingsProvider';
import { GlobalPortal } from '../../util/GlobalPortal';
function renderSettings(path = '/home', onLogout?: () => Promise<void>) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <GlobalSettingsProvider>
        <GlobalPortal.Provider>
          <MemoryRouter initialEntries={[path]}>
            <SettingsModal onLogout={onLogout} />
          </MemoryRouter>
        </GlobalPortal.Provider>
      </GlobalSettingsProvider>
    </QueryClientProvider>,
  );
}
afterEach(() => {
  cleanup();
  localStorage.clear();
});
describe('설정 모달', () => {
  it('닫으면 초점을 진입점에 돌려준다', async () => {
    const user = userEvent.setup();
    renderSettings();
    const trigger = screen.getByRole('button', { name: '설정' });
    await user.click(trigger);
    expect(screen.getByRole('dialog')).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it('음량 변경을 닫을 때 저장하고 다시 열어 유지한다', async () => {
    const user = userEvent.setup();
    renderSettings();
    await user.click(screen.getByRole('button', { name: '설정' }));
    const range = screen.getByRole('slider');
    fireEvent.change(range, { target: { value: '8' } });
    await user.click(screen.getByRole('button', { name: '모달 닫기' }));
    await user.click(screen.getByRole('button', { name: '설정' }));
    expect(screen.getByRole('slider')).toHaveValue('8');
  });
  it.each([
    '/table/customize/1',
    '/table/customize/1/end/feedback',
    '/table/customize/1/end/vote/2',
    '/live/1',
    '/vote/2',
  ])('후속 연결 화면 %s에는 진입점을 추가하지 않는다', (path) => {
    renderSettings(path);
    expect(
      screen.queryByRole('button', { name: '설정' }),
    ).not.toBeInTheDocument();
  });
});

it('조회·저장 실패에도 설정 상태와 재시도 버튼을 표시하지 않는다', async () => {
  setAccessToken('a');
  setMemberId(1);
  server.use(
    http.get(
      `${ApiUrl.member}/settings`,
      () => new HttpResponse(null, { status: 500 }),
    ),
    http.patch(
      `${ApiUrl.member}/settings`,
      () => new HttpResponse(null, { status: 500 }),
    ),
  );
  const user = userEvent.setup();
  renderSettings();
  await user.click(screen.getByRole('button', { name: '설정' }));
  fireEvent.change(screen.getByRole('slider'), { target: { value: '8' } });
  fireEvent.pointerUp(screen.getByRole('slider'));
  await waitFor(() => expect(screen.getByRole('slider')).toHaveValue('8'));
  expect(
    screen.queryByText(
      /설정을 불러오|설정.*저장.*(실패|중|되었습니다)|현재 탭에만/,
    ),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /재시도/ }),
  ).not.toBeInTheDocument();
});
it('설정 저장 응답을 기다리지 않고 로그아웃하며 최신 변경 요청을 발행한다', async () => {
  setAccessToken('a');
  setMemberId(1);
  let release!: () => void;
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  const bodies: unknown[] = [];
  server.use(
    http.patch(`${ApiUrl.member}/settings`, async ({ request }) => {
      bodies.push(await request.json());
      await blocked;
      return HttpResponse.json({ language: null, volume: 0.9 });
    }),
  );
  const onLogout = vi.fn().mockResolvedValue(undefined);
  const user = userEvent.setup();
  renderSettings('/home', onLogout);
  try {
    await user.click(screen.getByRole('button', { name: '설정' }));
    fireEvent.change(screen.getByRole('slider'), { target: { value: '7' } });
    fireEvent.pointerUp(screen.getByRole('slider'));
    await waitFor(() => expect(bodies).toHaveLength(1));
    fireEvent.change(screen.getByRole('slider'), { target: { value: '9' } });
    await user.click(screen.getByRole('button', { name: '로그아웃' }));
    expect(onLogout).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(bodies).toHaveLength(2));
    expect(bodies[1]).toEqual({ volume: 0.9 });
    expect(
      screen.queryByText('저장하지 않은 변경을 버리고 로그아웃할까요?'),
    ).not.toBeInTheDocument();
  } finally {
    release();
  }
});
