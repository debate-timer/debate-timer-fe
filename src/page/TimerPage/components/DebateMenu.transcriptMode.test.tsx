import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
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
  } as unknown as ReturnType<typeof useTranscriptRecorder>);
};

function Harness() {
  const controls = useDebateControls({
    tableId: 5,
    timeBoxIndex: 0,
    team: null,
    lang: 'ko-KR',
    isRunning: false,
    canShare: false,
    canTranscribe: true,
    stopTimers: () => {},
  });
  return <DebateMenu controls={controls} hasTranscriptFlag />;
}

async function openTranscriptConsent() {
  const user = userEvent.setup();
  render(
    <QueryClientProvider client={new QueryClient()}>
      <GlobalPortal.Provider>
        <Harness />
      </GlobalPortal.Provider>
    </QueryClientProvider>,
  );
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
