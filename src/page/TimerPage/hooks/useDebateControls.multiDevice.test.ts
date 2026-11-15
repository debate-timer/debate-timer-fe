import { act, renderHook } from '@testing-library/react';
import useDebateControls from './useDebateControls';
import useLiveShareSession from './useLiveShareSession';
import useTranscriptRecorder from './useTranscriptRecorder';

vi.mock('./useLiveShareSession');
vi.mock('./useTranscriptRecorder');

const getLastTransitionVersion = vi.fn(() => 42);
const issueEvent = vi.fn((...args: unknown[]) => args.length > 0);

const mockShare = (isSharing: boolean) =>
  vi.mocked(useLiveShareSession).mockReturnValue({
    shareUrl: 'https://debate-timer.com/live/5',
    getLastTransitionVersion,
    issueEvent,
    stopSharing: vi.fn(),
    isSharing,
    isError: false,
  } as unknown as ReturnType<typeof useLiveShareSession>);

const disableTranscript = vi.fn();

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
    disable: disableTranscript,
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
    issueEvent.mockClear();
    mockShare(true);
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

  describe('기존 공유 화면에 녹음 참여 전파', () => {
    const session = { sessionKey: 'session-1', joinCode: 'join' };
    const recordingCalls = () =>
      issueEvent.mock.calls.filter(
        (call: unknown[]) => call[0] === 'RECORDING_OPENED',
      );

    it('공유 중에 다기기 녹음 세션이 생기면 참가 정보를 한 번 발행한다', () => {
      mockRecorder(null);
      const { rerender } = renderHook(() => useDebateControls(options));
      expect(recordingCalls()).toHaveLength(0);

      mockRecorder(session);
      rerender();
      rerender();

      expect(recordingCalls()).toEqual([['RECORDING_OPENED', null, session]]);
    });

    it('공유하지 않으면 발행하지 않는다', () => {
      mockShare(false);
      mockRecorder(session);

      renderHook(() => useDebateControls(options));

      expect(recordingCalls()).toHaveLength(0);
    });

    it('상태 동기화에 응답한 뒤 다기기 녹음 세션이 있으면 참가 정보도 다시 발행한다', () => {
      const onSyncRequest = vi.fn(() => {
        issueEvent('SYNC');
      });
      mockShare(false);
      mockRecorder(session);
      renderHook(() => useDebateControls({ ...options, onSyncRequest }));
      const passedSync =
        vi.mocked(useLiveShareSession).mock.lastCall![1]?.onSyncRequest;

      passedSync?.();

      expect(onSyncRequest).toHaveBeenCalledTimes(1);
      expect(issueEvent.mock.calls.map((call: unknown[]) => call[0])).toEqual([
        'SYNC',
        'RECORDING_OPENED',
      ]);
    });

    it('다기기 녹음 세션이 없으면 상태 동기화 뒤에 발행하지 않는다', () => {
      mockShare(false);
      mockRecorder(null);
      renderHook(() => useDebateControls(options));

      vi.mocked(useLiveShareSession).mock.lastCall![1]?.onSyncRequest?.();

      expect(recordingCalls()).toHaveLength(0);
    });
  });

  describe('공유 화면에 녹음 종료 전파', () => {
    const session = { sessionKey: 'session-1', joinCode: 'join' };
    const closedCalls = () =>
      issueEvent.mock.calls.filter(
        (call: unknown[]) => call[0] === 'RECORDING_CLOSED',
      );

    beforeEach(() => {
      disableTranscript.mockReset();
    });

    it('공유 중에 다기기 녹음을 끄면 끝낸 세션의 참가 정보로 종료를 발행한다', () => {
      disableTranscript.mockReturnValue(session);
      mockRecorder(session);
      const { result } = renderHook(() => useDebateControls(options));

      act(() => result.current.requestTranscript(false));

      expect(closedCalls()).toEqual([['RECORDING_CLOSED', null, session]]);
    });

    it('공유하지 않으면 종료를 발행하지 않는다', () => {
      disableTranscript.mockReturnValue(session);
      mockShare(false);
      mockRecorder(session);
      const { result } = renderHook(() => useDebateControls(options));

      act(() => result.current.requestTranscript(false));

      expect(disableTranscript).toHaveBeenCalled();
      expect(closedCalls()).toHaveLength(0);
    });

    it('끝낸 다기기 녹음 세션이 없으면 종료를 발행하지 않는다', () => {
      disableTranscript.mockReturnValue(null);
      mockRecorder(null);
      const { result } = renderHook(() => useDebateControls(options));

      act(() => result.current.requestTranscript(false));

      expect(closedCalls()).toHaveLength(0);
    });
  });
});
