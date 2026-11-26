import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalPortal } from '../../../util/GlobalPortal';
import useDebateControls from '../hooks/useDebateControls';
import useTranscriptRecorder, {
  TranscriptRecorderMode,
} from '../hooks/useTranscriptRecorder';
import DebateMenu from './DebateMenu';

vi.mock('../../../hooks/sockets/useChairmanSocket', () => ({
  default: () => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    sendDebateEvent: vi.fn(),
    isConnected: false,
    isReplaced: false,
    error: null,
  }),
}));
vi.mock('../hooks/useTranscriptRecorder');

const mockRecorder = (
  modes: Partial<Record<TranscriptRecorderMode, boolean>>,
  state: Partial<ReturnType<typeof useTranscriptRecorder>> = {},
) => {
  const supportedModes = {
    RPC: false,
    SONIOX: false,
    MULTI_DEVICE: false,
    ...modes,
  };
  vi.mocked(useTranscriptRecorder).mockReturnValue({
    sttMode: supportedModes.RPC ? 'RPC' : 'SONIOX',
    supportedModes,
    multiDeviceSession: null,
    isModeLocked: false,
    isEnabled: false,
    isListening: false,
    isPending: false,
    utteranceCount: 0,
    pendingCount: 0,
    failedCount: 0,
    error: null,
    enable: vi.fn(),
    disable: vi.fn(),
    ...state,
  } as unknown as ReturnType<typeof useTranscriptRecorder>);
};

function Harness(props: {
  running?: boolean;
  shareFailed?: boolean;
  hasTranscript?: boolean;
}) {
  const controls = useDebateControls({
    tableId: 5,
    timeBoxIndex: 0,
    team: null,
    lang: 'ko-KR',
    isRunning: props.running ?? false,
    canShare: true,
    canTranscribe: true,
    stopTimers: () => {},
  });
  const share = props.shareFailed
    ? { ...controls.share, isError: true }
    : controls.share;
  return (
    <DebateMenu
      controls={{ ...controls, share }}
      hasTranscriptFlag={props.hasTranscript ?? true}
    />
  );
}

function renderMenu(props: Parameters<typeof Harness>[0] = {}) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <GlobalPortal.Provider>
        <Harness {...props} />
      </GlobalPortal.Provider>
    </QueryClientProvider>,
  );
}

async function openTranscriptConsent() {
  const user = userEvent.setup();
  renderMenu();
  await user.click(screen.getByRole('button', { name: '토론 메뉴' }));
  await user.click(screen.getByRole('button', { name: '속기록' }));
}

describe('토론 메뉴 음성 인식 방식 선택지', () => {
  it('두 방식을 모두 지원하면 둘 다 고를 수 있다', async () => {
    mockRecorder({ RPC: true, SONIOX: true });

    await openTranscriptConsent();

    expect(
      screen.getByRole('radio', { name: '크롬 실시간 인식' }),
    ).toBeChecked();
    expect(
      screen.getByRole('radio', { name: 'Soniox 구간 전사' }),
    ).toBeInTheDocument();
  });

  it('다기기 녹음을 고를 수 있으면 선택지와 청중 참여 안내를 보여준다', async () => {
    mockRecorder({ RPC: true, SONIOX: true, MULTI_DEVICE: true });

    await openTranscriptConsent();
    await userEvent.click(
      screen.getByRole('radio', { name: 'Soniox 다기기 녹음' }),
    );

    expect(
      screen.getByRole('radio', { name: 'Soniox 다기기 녹음' }),
    ).toBeChecked();
    expect(
      screen.getByText(
        '실시간 공유 링크로 들어온 청중의 기기도 녹음에 참여하고, 가장 깨끗한 녹음으로 속기록을 만들어요.',
      ),
    ).toBeInTheDocument();
  });

  it('다기기 녹음을 고를 수 있는데 다른 방식을 고르면 청중 녹음이 열리지 않음을 알려준다', async () => {
    mockRecorder({ RPC: true, SONIOX: true, MULTI_DEVICE: true });

    await openTranscriptConsent();

    expect(
      screen.getByText(
        "청중 기기도 함께 녹음하려면 'Soniox 다기기 녹음'을 골라 주세요.",
      ),
    ).toBeInTheDocument();
  });

  it('크롬 실시간 인식을 지원하지 않으면 선택지를 보여주지 않는다', async () => {
    mockRecorder({ RPC: false, SONIOX: true });

    await openTranscriptConsent();

    expect(
      screen.getByText('참여자 모두에게 녹음 동의를 받아 주세요.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });
});

describe('토론 기능의 상태 안내', () => {
  it.each([
    [false, false, '비활성화'],
    [true, false, '녹음 대기 중'],
    [true, true, '녹음 중...'],
  ] as const)(
    '속기 활성 %s, 주 타이머 실행 %s이면 %s로 표시한다',
    async (enabled, running, label) => {
      mockRecorder(
        { RPC: true },
        { isEnabled: enabled, isListening: !running },
      );
      renderMenu({ running });
      await userEvent.click(screen.getByRole('button', { name: '토론 메뉴' }));
      const section = within(screen.getByRole('region', { name: '속기록' }));
      expect(section.getByText(label)).toBeInTheDocument();
      if (!enabled)
        expect(section.queryByText(/문장 기록/)).not.toBeInTheDocument();
    },
  );
  it('공유 실패와 일부 구간 전사 실패를 각각 알리고 녹음 상태와 진행 수치를 유지한다', async () => {
    mockRecorder(
      { SONIOX: true },
      { isEnabled: true, utteranceCount: 12, pendingCount: 2, failedCount: 1 },
    );
    renderMenu({ running: true, shareFailed: true });
    await userEvent.click(screen.getByRole('button', { name: '토론 메뉴' }));
    expect(screen.getByText('공유 오류')).toBeInTheDocument();
    expect(screen.getByText('녹음 중...')).toBeInTheDocument();
    expect(
      screen.getByText('12문장 기록 · 2개 구간 전사 중'),
    ).toBeInTheDocument();
    expect(screen.getByText('1개 구간 전사 실패')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '속기록', pressed: true }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: '속기 다시 시도' }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: '공유 다시 시도' }),
    ).toBeEnabled();
  });
  it('다기기 녹음을 꺼도 남은 구간을 표시하고 로컬 문장 수는 생략한다', async () => {
    mockRecorder(
      { MULTI_DEVICE: true },
      { sttMode: 'MULTI_DEVICE', pendingCount: 2 },
    );
    renderMenu();
    await userEvent.click(screen.getByRole('button', { name: '토론 메뉴' }));
    expect(screen.getByText('2개 구간 전사 중')).toBeInTheDocument();
    expect(screen.queryByText(/문장 기록/)).not.toBeInTheDocument();
  });
  it('속기 기능이 제공되지 않으면 메뉴에서 생략한다', async () => {
    mockRecorder({ RPC: true });
    renderMenu({ hasTranscript: false });
    await userEvent.click(screen.getByRole('button', { name: '토론 메뉴' }));
    expect(
      screen.queryByRole('region', { name: '속기록' }),
    ).not.toBeInTheDocument();
  });
});
