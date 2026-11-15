import { renderHook } from '@testing-library/react';
import useDebateControls from './useDebateControls';
import useLiveShareSession from './useLiveShareSession';
import useTranscriptRecorder from './useTranscriptRecorder';

vi.mock('./useLiveShareSession');
vi.mock('./useTranscriptRecorder');

const getLastTransitionVersion = vi.fn(() => 42);

const mockRecorder = (
  multiDeviceSession: { sessionKey: string; joinCode: string } | null,
) =>
  vi.mocked(useTranscriptRecorder).mockReturnValue({
    sttMode: 'MULTI_DEVICE',
    supportedModes: { RPC: true, SONIOX: true, MULTI_DEVICE: true },
    multiDeviceSession,
    isModeLocked: false,
    isEnabled: false,
    isPending: false,
    failedCount: 0,
    error: null,
    discard: vi.fn(),
  } as unknown as ReturnType<typeof useTranscriptRecorder>);

const options = {
  tableId: 5,
  timeBoxIndex: 0,
  team: null,
  lang: 'ko-KR',
  isRunning: false,
  canShare: true,
  canTranscribe: true,
  canUseMultiDevice: true,
  stopTimers: () => {},
};

describe('토론 제어의 다기기 녹음 연결', () => {
  beforeEach(() => {
    vi.mocked(useLiveShareSession).mockReturnValue({
      shareUrl: 'https://debate-timer.com/live/5',
      getLastTransitionVersion,
      stopSharing: vi.fn(),
      isSharing: true,
      isError: false,
    } as unknown as ReturnType<typeof useLiveShareSession>);
  });

  it('다기기 녹음 플래그와 공유 이벤트 version을 기록 훅에 넘긴다', () => {
    mockRecorder(null);

    renderHook(() => useDebateControls(options));

    const passed = vi.mocked(useTranscriptRecorder).mock.lastCall![0];
    expect(passed.isMultiDeviceAllowed).toBe(true);
    expect(passed.getSegmentVersion?.()).toBe(42);
  });

  it('다기기 녹음 중이면 공유 링크에 녹음 세션과 참가 코드를 붙인다', () => {
    mockRecorder({ sessionKey: 'session-1', joinCode: 'join' });

    const { result } = renderHook(() => useDebateControls(options));

    expect(result.current.shareUrl).toBe(
      'https://debate-timer.com/live/5#rec=session-1&code=join',
    );
  });

  it('다기기 녹음이 아니면 공유 링크를 그대로 쓴다', () => {
    mockRecorder(null);

    const { result } = renderHook(() => useDebateControls(options));

    expect(result.current.shareUrl).toBe('https://debate-timer.com/live/5');
  });
});
