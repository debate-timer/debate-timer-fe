import { act, renderHook, waitFor } from '@testing-library/react';
import {
  postRecordingDeviceV2,
  postRecordingTurnV2,
} from '../../../apis/apis/recordingV2';
import { APIError } from '../../../apis/primitives';
import { SocketMessage, TimerDataPayload } from '../../../apis/sockets/type';
import {
  getAudienceDeviceTokenV2,
  saveAudienceDeviceTokenV2,
} from '../../../util/recordingStorageV2';
import useAudienceTurnRecorder, {
  UseAudienceTurnRecorderParams,
} from './useAudienceTurnRecorder';

// jsdom의 FormData·Blob 업로드는 MSW에서 끝나지 않아 API 함수 경계를 대체한다.
vi.mock('../../../apis/apis/recordingV2', () => ({
  postRecordingDeviceV2: vi.fn(),
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

const join = { sessionKey: 'session-1', joinCode: 'join' };

const normal = (sequence: number, isRunning: boolean): TimerDataPayload => ({
  timerType: 'NORMAL',
  sequence,
  remainingTime: 60,
  isRunning,
});

const timeBased = (
  currentTeam: 'PROS' | 'CONS',
  isRunning: boolean,
): TimerDataPayload => ({
  timerType: 'TIME_BASED',
  sequence: 2,
  currentTeam,
  remainingTime: 60,
  isRunning,
  prosRemainingTime: 120,
  consRemainingTime: 120,
});

const message = (
  eventType: 'PLAY' | 'STOP' | 'NEXT' | 'TEAM_SWITCH' | 'SYNC',
  data: TimerDataPayload,
  version: number,
): SocketMessage => ({ eventType, data, version, serverTime: null });

const render = () =>
  renderHook(
    (props: UseAudienceTurnRecorderParams) => useAudienceTurnRecorder(props),
    {
      initialProps: {
        join,
        latestMessage: null,
        latestMessageReceivedAt: null,
        isConnected: true,
      } as UseAudienceTurnRecorderParams,
    },
  );

type Rendered = ReturnType<typeof render>;

const receive = (
  rendered: Rendered,
  latestMessage: SocketMessage | null,
  isConnected = true,
) =>
  rendered.rerender({
    join,
    latestMessage,
    latestMessageReceivedAt: Date.now(),
    isConnected,
  });

const uploadedTurnKeys = () =>
  vi.mocked(postRecordingTurnV2).mock.calls.map(([, turnKey]) => turnKey);

describe('다기기 녹음 청중 훅', () => {
  beforeEach(() => {
    sessionStorage.clear();
    FakeMediaRecorder.instances = [];
    vi.useFakeTimers({ toFake: ['Date', 'performance'] });
    vi.setSystemTime(10_000);
    vi.mocked(postRecordingDeviceV2).mockReset().mockResolvedValue({
      deviceId: 'audience',
      deviceToken: 'audience-token',
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

  describe('참여 시작', () => {
    it('참가 코드로 기기 토큰을 받아 보관하고 녹음 대기 상태가 된다', async () => {
      const rendered = render();

      await act(() => rendered.result.current.start());

      expect(postRecordingDeviceV2).toHaveBeenCalledWith('session-1', {
        joinCode: 'join',
      });
      expect(getAudienceDeviceTokenV2('session-1')).toBe('audience-token');
      expect(rendered.result.current.status).toBe('recording');
    });

    it('이 탭에서 이미 참가했으면 다시 참가하지 않는다', async () => {
      saveAudienceDeviceTokenV2('session-1', 'saved-token');
      const rendered = render();

      await act(() => rendered.result.current.start());

      expect(postRecordingDeviceV2).not.toHaveBeenCalled();
      expect(rendered.result.current.status).toBe('recording');
    });

    it('참가에 실패하면 마이크를 놓고 참가 오류를 알린다', async () => {
      vi.mocked(postRecordingDeviceV2).mockRejectedValueOnce(new Error('403'));
      const rendered = render();

      await act(() => rendered.result.current.start());

      expect(rendered.result.current.error).toBe('join');
      expect(rendered.result.current.status).toBe('idle');
      expect(trackStop).toHaveBeenCalled();
    });

    it('참가하려던 세션이 이미 끝났으면 그 세션으로는 참여할 수 없게 한다', async () => {
      vi.mocked(postRecordingDeviceV2).mockRejectedValueOnce(
        new APIError('이미 끝난 녹음 세션입니다.', 409, {}),
      );
      const rendered = render();

      await act(() => rendered.result.current.start());

      expect(rendered.result.current.status).toBe('idle');
      expect(rendered.result.current.error).toBeNull();
      expect(rendered.result.current.isAvailable).toBe(false);
      expect(trackStop).toHaveBeenCalled();
    });

    it('참여를 시작하는 중에 다시 불러도 마이크를 한 번만 받는다', async () => {
      const rendered = render();

      await act(async () => {
        await Promise.all([
          rendered.result.current.start(),
          rendered.result.current.start(),
        ]);
      });

      expect(getUserMedia).toHaveBeenCalledTimes(1);
      expect(rendered.result.current.status).toBe('recording');

      act(() => rendered.result.current.stop());
      expect(trackStop).toHaveBeenCalledTimes(1);
    });

    it('마이크 권한이 없으면 권한 오류를 알린다', async () => {
      getUserMedia.mockRejectedValueOnce(new Error('denied'));
      const rendered = render();

      await act(() => rendered.result.current.start());

      expect(rendered.result.current.error).toBe('not-allowed');
      expect(postRecordingDeviceV2).not.toHaveBeenCalled();
    });
  });

  describe('구간 녹음', () => {
    it('재생 이벤트로 시작한 구간을 정지 이벤트에서 그 version의 턴으로 올린다', async () => {
      const rendered = render();
      await act(() => rendered.result.current.start());

      receive(rendered, message('PLAY', normal(0, true), 100));
      expect(rendered.result.current.isListening).toBe(true);
      receive(rendered, message('STOP', normal(0, false), 101));

      await waitFor(() => expect(postRecordingTurnV2).toHaveBeenCalled());
      const [sessionKey, turnKey, deviceToken, turn] =
        vi.mocked(postRecordingTurnV2).mock.calls[0];
      expect([sessionKey, turnKey, deviceToken]).toEqual([
        'session-1',
        '0-100',
        'audience-token',
      ]);
      expect(turn).toMatchObject({
        timeBoxIndex: 0,
        team: null,
        durationMs: 2_000,
      });
    });

    it('중도 입장해 상태 동기화로만 알게 된 진행 중 구간은 건너뛴다', async () => {
      const rendered = render();
      await act(() => rendered.result.current.start());

      receive(rendered, message('SYNC', normal(0, true), 200));
      receive(rendered, message('STOP', normal(0, false), 201));
      receive(rendered, message('NEXT', normal(1, false), 202));
      receive(rendered, message('PLAY', normal(1, true), 203));
      receive(rendered, message('STOP', normal(1, false), 204));

      await waitFor(() => expect(postRecordingTurnV2).toHaveBeenCalledTimes(1));
      expect(uploadedTurnKeys()).toEqual(['1-203']);
    });

    it('연결이 유지된 채 같은 구간의 동기화를 받으면 그대로 이어서 녹음한다', async () => {
      const rendered = render();
      await act(() => rendered.result.current.start());

      receive(rendered, message('PLAY', normal(0, true), 300));
      receive(rendered, message('SYNC', normal(0, true), 301));
      receive(rendered, message('STOP', normal(0, false), 302));

      await waitFor(() => expect(postRecordingTurnV2).toHaveBeenCalledTimes(1));
      expect(uploadedTurnKeys()).toEqual(['0-300']);
    });

    it('재연결 뒤 받은 동기화에서는 진행 중인 구간을 끝내고 다음 시작 이벤트를 기다린다', async () => {
      const rendered = render();
      await act(() => rendered.result.current.start());

      receive(rendered, message('PLAY', normal(0, true), 300));
      // 끊긴 사이 STOP v301, PLAY v302를 놓쳤다.
      receive(rendered, null, false);
      receive(rendered, null, true);
      receive(rendered, message('SYNC', normal(0, true), 9_999));

      await waitFor(() => expect(postRecordingTurnV2).toHaveBeenCalledTimes(1));
      expect(uploadedTurnKeys()).toEqual(['0-300']);
      expect(rendered.result.current.isListening).toBe(false);

      receive(rendered, message('STOP', normal(0, false), 303));
      receive(rendered, message('PLAY', normal(0, true), 304));
      receive(rendered, message('STOP', normal(0, false), 305));

      await waitFor(() => expect(postRecordingTurnV2).toHaveBeenCalledTimes(2));
      expect(uploadedTurnKeys()).toEqual(['0-300', '0-304']);
    });

    it('녹음 중 참가 정보가 바뀌어도 이전 세션 턴은 그 세션의 토큰으로 올리고 새 세션에 다시 참가하지 않는다', async () => {
      const rendered = render();
      await act(() => rendered.result.current.start());
      receive(rendered, message('PLAY', normal(0, true), 310));

      saveAudienceDeviceTokenV2('session-2', 'other-token');
      rendered.rerender({
        join: { sessionKey: 'session-2', joinCode: 'join-2' },
        latestMessage: message('STOP', normal(0, false), 311),
        latestMessageReceivedAt: Date.now(),
        isConnected: true,
      });

      await waitFor(() => expect(postRecordingTurnV2).toHaveBeenCalledTimes(1));
      const [sessionKey, , deviceToken] =
        vi.mocked(postRecordingTurnV2).mock.calls[0];
      expect([sessionKey, deviceToken]).toEqual([
        'session-1',
        'audience-token',
      ]);
      expect(postRecordingDeviceV2).toHaveBeenCalledTimes(1);
    });

    it('사회자가 녹음을 꺼 참가 정보가 사라지면 진행 중인 구간은 올리지 않고 참여를 멈춘다', async () => {
      const rendered = render();
      await act(() => rendered.result.current.start());
      receive(rendered, message('PLAY', normal(0, true), 320));
      expect(rendered.result.current.isListening).toBe(true);

      rendered.rerender({
        join: null,
        latestMessage: message('PLAY', normal(0, true), 320),
        latestMessageReceivedAt: Date.now(),
        isConnected: true,
      });

      expect(rendered.result.current.status).toBe('idle');
      expect(rendered.result.current.isListening).toBe(false);
      expect(rendered.result.current.isAvailable).toBe(false);
      expect(trackStop).toHaveBeenCalled();
      expect(postRecordingTurnV2).not.toHaveBeenCalled();
    });

    it('참여 중에 다른 세션의 참가 정보를 받으면 참여를 멈추고 새 세션 참여를 기다린다', async () => {
      const rendered = render();
      await act(() => rendered.result.current.start());

      rendered.rerender({
        join: { sessionKey: 'session-2', joinCode: 'join-2' },
        latestMessage: null,
        latestMessageReceivedAt: null,
        isConnected: true,
      });

      expect(rendered.result.current.status).toBe('idle');
      expect(rendered.result.current.isAvailable).toBe(true);
    });

    it('자유토론에서 실행 중 팀이 바뀌면 팀 전환 이벤트의 version으로 새 턴을 시작한다', async () => {
      const rendered = render();
      await act(() => rendered.result.current.start());

      receive(rendered, message('PLAY', timeBased('PROS', true), 400));
      receive(rendered, message('TEAM_SWITCH', timeBased('CONS', true), 401));
      receive(rendered, message('STOP', timeBased('CONS', false), 402));

      await waitFor(() => expect(postRecordingTurnV2).toHaveBeenCalledTimes(2));
      expect(
        vi
          .mocked(postRecordingTurnV2)
          .mock.calls.map(([, turnKey, , turn]) => [turnKey, turn.team]),
      ).toEqual([
        ['2-400', 'PROS'],
        ['2-401', 'CONS'],
      ]);
    });

    it('토론 종료 이벤트에서 진행 중인 구간을 올린다', async () => {
      const rendered = render();
      await act(() => rendered.result.current.start());

      receive(rendered, message('PLAY', normal(0, true), 500));
      receive(rendered, { eventType: 'FINISHED', data: null, version: 501 });

      await waitFor(() => expect(postRecordingTurnV2).toHaveBeenCalledTimes(1));
    });

    it('참여 전에 받은 이벤트로는 녹음하지 않는다', () => {
      const rendered = render();

      receive(rendered, message('PLAY', normal(0, true), 600));

      expect(FakeMediaRecorder.instances).toHaveLength(0);
    });

    it('참여를 멈추면 진행 중인 구간까지 올리고 마이크를 놓는다', async () => {
      const rendered = render();
      await act(() => rendered.result.current.start());
      receive(rendered, message('PLAY', normal(0, true), 700));

      act(() => rendered.result.current.stop());

      await waitFor(() => expect(postRecordingTurnV2).toHaveBeenCalledTimes(1));
      expect(rendered.result.current.status).toBe('idle');
      expect(trackStop).toHaveBeenCalled();
    });
  });

  it('공유 링크에 참가 정보가 없으면 참여할 수 없다', () => {
    const { result } = renderHook(() =>
      useAudienceTurnRecorder({
        join: null,
        latestMessage: null,
        latestMessageReceivedAt: null,
        isConnected: true,
      }),
    );

    expect(result.current.isAvailable).toBe(false);
  });
});
