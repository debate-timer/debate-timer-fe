import { act, renderHook, waitFor } from '@testing-library/react';
import {
  getRecordingSessionV2,
  postRecordingHostDeviceV2,
  postRecordingSessionV2,
  postRecordingTurnV2,
} from '../../../apis/apis/recordingV2';
import {
  getHostRecordingV2,
  saveHostRecordingV2,
} from '../../../util/recordingStorageV2';
import useMultiDeviceTranscriber, {
  UseMultiDeviceTranscriberParams,
} from './useMultiDeviceTranscriber';

// jsdom의 FormData·Blob 업로드는 MSW에서 끝나지 않아 API 함수 경계를 대체한다.
// 요청 형식은 src/apis/apis/recordingV2*.test.ts가 MSW로 검증한다.
vi.mock('../../../apis/apis/recordingV2', () => ({
  getRecordingSessionV2: vi.fn(),
  postRecordingSessionV2: vi.fn(),
  postRecordingHostDeviceV2: vi.fn(),
  postRecordingTurnV2: vi.fn(),
}));

class FakeMediaRecorder {
  static instances: FakeMediaRecorder[] = [];
  static isTypeSupported = vi.fn(() => true);
  mimeType: string;
  state: 'inactive' | 'recording' = 'inactive';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  start = vi.fn(() => {
    this.state = 'recording';
  });
  stop = vi.fn(() => {
    this.state = 'inactive';
    vi.advanceTimersByTime(2_000);
    this.ondataavailable?.({
      data: new Blob(['audio'], { type: this.mimeType }),
    });
    this.onstop?.();
  });
  constructor(
    public stream: MediaStream,
    options?: { mimeType?: string },
  ) {
    this.mimeType = options?.mimeType ?? 'audio/webm';
    FakeMediaRecorder.instances.push(this);
  }
}

const trackStop = vi.fn();
const getUserMedia = vi.fn(async () => ({
  active: true,
  getTracks: () => [{ stop: trackStop }],
}));

let segmentVersion: number | null = 500;

const baseParams: UseMultiDeviceTranscriberParams = {
  tableId: 7,
  timeBoxIndex: 0,
  team: null,
  isRunning: false,
  lang: 'ko-KR',
  getSegmentVersion: () => segmentVersion,
};

const render = (params: Partial<UseMultiDeviceTranscriberParams> = {}) =>
  renderHook(
    (props: UseMultiDeviceTranscriberParams) =>
      useMultiDeviceTranscriber(props),
    { initialProps: { ...baseParams, ...params } },
  );

const uploadedTurns = () =>
  vi.mocked(postRecordingTurnV2).mock.calls.map(([, turnKey, , turn]) => ({
    turnKey,
    timeBoxIndex: turn.timeBoxIndex,
    team: turn.team,
  }));

describe('다기기 녹음 사회자 훅', () => {
  beforeEach(() => {
    sessionStorage.clear();
    segmentVersion = 500;
    FakeMediaRecorder.instances = [];
    vi.useFakeTimers({ toFake: ['Date', 'performance'] });
    vi.setSystemTime(1_000);
    vi.mocked(postRecordingSessionV2).mockReset().mockResolvedValue({
      sessionKey: 'session-1',
      joinCode: 'join',
      deviceId: 'host',
      deviceToken: 'host-token',
    });
    vi.mocked(postRecordingHostDeviceV2).mockReset();
    vi.mocked(getRecordingSessionV2).mockReset().mockResolvedValue({
      sessionKey: 'saved',
      status: 'RECORDING',
      transcriptId: null,
      errorMessage: null,
      turns: [],
    });
    vi.mocked(postRecordingTurnV2).mockReset().mockResolvedValue();
    getUserMedia.mockClear();
    trackStop.mockClear();
    vi.stubGlobal('MediaRecorder', FakeMediaRecorder);
    vi.stubGlobal('AudioContext', undefined);
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('켜기', () => {
    it('처음 켜면 녹음 세션을 열고 탭에 보관한다', async () => {
      const { result } = render();

      await act(() => result.current.enable());

      expect(postRecordingSessionV2).toHaveBeenCalledWith({
        tableId: 7,
        language: 'ko-KR',
      });
      expect(result.current.isEnabled).toBe(true);
      expect(result.current.session).toEqual({
        sessionKey: 'session-1',
        joinCode: 'join',
      });
      expect(getHostRecordingV2(7)?.deviceToken).toBe('host-token');
    });

    it('이 탭에 열어 둔 녹음 세션이 있으면 새로 열지 않고 이어서 쓴다', async () => {
      saveHostRecordingV2(7, {
        sessionKey: 'saved',
        joinCode: 'saved-join',
        deviceToken: 'saved-token',
      });
      const { result } = render();

      await act(() => result.current.enable());

      expect(postRecordingSessionV2).not.toHaveBeenCalled();
      expect(result.current.session?.sessionKey).toBe('saved');
    });

    it('이 탭에 남은 세션이 이미 끝났으면 새 세션을 연다', async () => {
      saveHostRecordingV2(7, {
        sessionKey: 'saved',
        joinCode: 'saved-join',
        deviceToken: 'saved-token',
      });
      vi.mocked(getRecordingSessionV2).mockResolvedValueOnce({
        sessionKey: 'saved',
        status: 'COMPLETED',
        transcriptId: 3,
        errorMessage: null,
        turns: [],
      });
      const { result } = render();

      await act(() => result.current.enable());

      expect(postRecordingSessionV2).toHaveBeenCalledTimes(1);
      expect(result.current.session?.sessionKey).toBe('session-1');
      expect(getHostRecordingV2(7)?.sessionKey).toBe('session-1');
    });

    it('마이크 권한이 없으면 세션을 열지 않고 권한 오류를 알린다', async () => {
      getUserMedia.mockRejectedValueOnce(new Error('denied'));
      const { result } = render();

      await act(() => result.current.enable());

      expect(result.current.error).toBe('not-allowed');
      expect(postRecordingSessionV2).not.toHaveBeenCalled();
      expect(result.current.isEnabled).toBe(false);
    });

    it('세션을 열지 못하면 마이크를 놓고 세션 오류를 알린다', async () => {
      vi.mocked(postRecordingSessionV2).mockRejectedValueOnce(new Error('500'));
      const { result } = render();

      await act(() => result.current.enable());

      expect(result.current.error).toBe('session');
      expect(result.current.isEnabled).toBe(false);
      expect(trackStop).toHaveBeenCalled();
    });
  });

  describe('구간 녹음', () => {
    it('타이머가 멈추면 구간을 시작한 공유 이벤트 version으로 턴을 올린다', async () => {
      const { result, rerender } = render();
      await act(() => result.current.enable());

      rerender({ ...baseParams, isRunning: true });
      expect(result.current.isListening).toBe(true);
      rerender({ ...baseParams, isRunning: false });

      await waitFor(() => expect(postRecordingTurnV2).toHaveBeenCalled());
      const [sessionKey, turnKey, deviceToken, turn] =
        vi.mocked(postRecordingTurnV2).mock.calls[0];
      expect([sessionKey, turnKey, deviceToken]).toEqual([
        'session-1',
        '0-500',
        'host-token',
      ]);
      expect(turn).toMatchObject({
        timeBoxIndex: 0,
        team: null,
        durationMs: 2_000,
        startedAtEpochMs: 1_000,
        metrics: null,
      });
      expect(result.current.isListening).toBe(false);
    });

    it('자유토론 팀이 바뀌면 새 턴으로 나눈다', async () => {
      const { result, rerender } = render({ team: 'PROS' });
      await act(() => result.current.enable());

      rerender({ ...baseParams, team: 'PROS', isRunning: true });
      segmentVersion = 600;
      rerender({ ...baseParams, team: 'CONS', isRunning: true });
      rerender({ ...baseParams, team: 'CONS', isRunning: false });

      await waitFor(() => expect(postRecordingTurnV2).toHaveBeenCalledTimes(2));
      expect(uploadedTurns()).toEqual([
        { turnKey: '0-500', timeBoxIndex: 0, team: 'PROS' },
        { turnKey: '0-600', timeBoxIndex: 0, team: 'CONS' },
      ]);
    });

    it('공유하지 않거나 같은 version이 남아 있으면 이 기기만의 턴 키를 쓴다', async () => {
      const { result, rerender } = render();
      await act(() => result.current.enable());

      rerender({ ...baseParams, isRunning: true });
      rerender({ ...baseParams, isRunning: false });
      rerender({ ...baseParams, isRunning: true });
      rerender({ ...baseParams, isRunning: false });
      segmentVersion = null;
      rerender({ ...baseParams, timeBoxIndex: 1, isRunning: true });
      rerender({ ...baseParams, timeBoxIndex: 1, isRunning: false });

      await waitFor(() => expect(postRecordingTurnV2).toHaveBeenCalledTimes(3));
      const turnKeys = uploadedTurns().map((turn) => turn.turnKey);
      expect(turnKeys[0]).toBe('0-500');
      expect(turnKeys[1]).toMatch(/^0-\d+$/);
      expect(turnKeys[1]).not.toBe('0-500');
      expect(turnKeys[2]).toMatch(/^1-\d+$/);
    });

    it('녹음을 끄면 진행 중인 구간까지 올리고 세션은 남긴다', async () => {
      const { result, rerender } = render();
      await act(() => result.current.enable());
      rerender({ ...baseParams, isRunning: true });

      act(() => result.current.disable());

      await waitFor(() => expect(postRecordingTurnV2).toHaveBeenCalledTimes(1));
      expect(result.current.isEnabled).toBe(false);
      expect(getHostRecordingV2(7)).not.toBeNull();
    });

    it('기록을 버리면 진행 중인 구간을 올리지 않고 보관한 세션을 지운다', async () => {
      const { result, rerender } = render();
      await act(() => result.current.enable());
      rerender({ ...baseParams, isRunning: true });

      act(() => result.current.discard());

      expect(postRecordingTurnV2).not.toHaveBeenCalled();
      expect(getHostRecordingV2(7)).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('화면을 떠나면 녹음 중이던 구간까지 올리고 마이크를 놓는다', async () => {
      const { result, rerender, unmount } = render();
      await act(() => result.current.enable());
      rerender({ ...baseParams, isRunning: true });

      unmount();

      await waitFor(() => expect(postRecordingTurnV2).toHaveBeenCalledTimes(1));
      expect(trackStop).toHaveBeenCalled();
    });
  });
});
