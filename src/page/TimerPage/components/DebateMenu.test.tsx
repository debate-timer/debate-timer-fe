import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ApiUrl } from '../../../apis/endpoints';
import { server } from '../../../mocks/server';
import { GlobalPortal } from '../../../util/GlobalPortal';
import useDebateControls from '../hooks/useDebateControls';
import DebateMenu from './DebateMenu';
import DebateFeatureIndicators from './DebateFeatureIndicators';

const CONNECT = vi.hoisted(() => vi.fn());
const DISCONNECT = vi.hoisted(() => vi.fn());
vi.mock('../../../hooks/sockets/useChairmanSocket', () => ({
  default: () => ({
    connect: CONNECT,
    disconnect: DISCONNECT,
    sendDebateEvent: vi.fn(),
    isConnected: false,
    isReplaced: false,
    error: null,
  }),
}));

function Harness(props: { canShare?: boolean }) {
  const controls = useDebateControls({
    tableId: 5,
    timeBoxIndex: 0,
    team: null,
    lang: 'ko-KR',
    isRunning: false,
    canShare: props.canShare ?? true,
    canTranscribe: false,
    stopTimers: () => {},
  });
  return (
    <>
      <DebateMenu controls={controls} transcriptUnavailableReason="회원 전용" />
      <DebateFeatureIndicators statuses={controls.statuses} />
      <output>{controls.isInputBlocked ? '입력 차단' : '입력 허용'}</output>
    </>
  );
}
function renderSubject(canShare = true) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <GlobalPortal.Provider>
        <Harness canShare={canShare} />
      </GlobalPortal.Provider>
    </QueryClientProvider>,
  );
}

describe('토론 메뉴와 실제 제어 훅 조립', () => {
  beforeEach(() => vi.clearAllMocks());
  it('메뉴 개폐·확인 취소로 공유를 시작하지 않고 포커스를 복귀한다', async () => {
    const token = vi.fn();
    server.use(
      http.get(`${ApiUrl.live}/5/chairman-token`, () => {
        token();
        return HttpResponse.json({ chairmanToken: 'token' });
      }),
    );
    const user = userEvent.setup();
    renderSubject();
    await user.click(screen.getByRole('button', { name: '토론 메뉴' }));
    expect(screen.getByText('입력 차단')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '실시간 공유' }));
    await user.click(screen.getByRole('button', { name: '취소' }));
    expect(screen.getByRole('button', { name: '실시간 공유' })).toHaveFocus();
    expect(token).not.toHaveBeenCalled();
    expect(CONNECT).not.toHaveBeenCalled();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: '토론 메뉴' })).toHaveFocus();
    expect(screen.getByText('입력 허용')).toBeInTheDocument();
  });
  it('공유 확인 뒤에만 토큰을 받고 메뉴를 닫아도 연결 시도를 유지한다', async () => {
    server.use(
      http.get(`${ApiUrl.live}/5/chairman-token`, () =>
        HttpResponse.json({ chairmanToken: 'token' }),
      ),
    );
    const user = userEvent.setup();
    renderSubject();
    await user.click(screen.getByRole('button', { name: '토론 메뉴' }));
    await user.click(screen.getByRole('button', { name: '실시간 공유' }));
    await user.click(screen.getByRole('button', { name: '공유 시작' }));
    await waitFor(() => expect(CONNECT).toHaveBeenCalledTimes(1));
    await user.keyboard('{Escape}');
    expect(CONNECT).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: '토론 메뉴' }));
    expect(screen.getByText('공유 연결 중')).toBeInTheDocument();
  });
  it('답변 선택값은 꺼도 유지하고 입력 요소의 키를 메뉴에서 처리한다', async () => {
    const user = userEvent.setup();
    renderSubject();
    await user.click(screen.getByRole('button', { name: '토론 메뉴' }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '45' } });
    await user.click(screen.getByRole('button', { name: '답변 시간' }));
    expect(screen.getByRole('combobox')).toHaveValue('45');
    expect(screen.getByRole('button', { name: '답변 시간' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByText('답변 시간: 비활성화')).toBeInTheDocument();
  });
  it('허용되지 않은 기능은 비활성으로 표시한다', async () => {
    const user = userEvent.setup();
    renderSubject(false);
    await user.click(screen.getByRole('button', { name: '토론 메뉴' }));
    expect(screen.getByRole('button', { name: '실시간 공유' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '속기록' })).toBeDisabled();
  });
});
