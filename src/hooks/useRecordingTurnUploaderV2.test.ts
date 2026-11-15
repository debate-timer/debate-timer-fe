import { act, renderHook } from '@testing-library/react';
import { postRecordingTurnV2 } from '../apis/apis/recordingV2';
import { APIError } from '../apis/primitives';
import { PostRecordingTurnV2RequestType } from '../apis/requests/recordingV2';
import useRecordingTurnUploaderV2 from './useRecordingTurnUploaderV2';

// jsdom의 FormData 업로드는 MSW로 끝나지 않으므로 API 함수를 대신한다. 요청 형식은 API 테스트가 검증한다.
vi.mock('../apis/apis/recordingV2', () => ({
  postRecordingTurnV2: vi.fn(),
}));

const turn: PostRecordingTurnV2RequestType = {
  audio: new Blob(['audio']),
  fileName: 'segment.webm',
  timeBoxIndex: 0,
  team: null,
  durationMs: 2_000,
  startedAtEpochMs: 1_000,
  metrics: null,
};

const upload = { sessionKey: 'session-1', turnKey: '0-1', turn };

describe('다기기 녹음 턴 업로드 훅', () => {
  beforeEach(() => {
    vi.mocked(postRecordingTurnV2).mockReset();
  });

  it('기기 토큰으로 턴을 올리고 대기 수를 되돌린다', async () => {
    vi.mocked(postRecordingTurnV2).mockResolvedValue();
    const { result } = renderHook(() =>
      useRecordingTurnUploaderV2({
        getDeviceToken: () => 'token',
        renewDeviceToken: vi.fn(),
      }),
    );

    let outcome;
    await act(async () => {
      outcome = await result.current.upload(upload);
    });

    expect(outcome).toBe('uploaded');
    expect(postRecordingTurnV2).toHaveBeenCalledWith(
      'session-1',
      '0-1',
      'token',
      turn,
    );
    expect(result.current.pendingCount).toBe(0);
    expect(result.current.failedCount).toBe(0);
  });

  it('기기 토큰이 무효하면 새 토큰을 받아 한 번 다시 올린다', async () => {
    vi.mocked(postRecordingTurnV2)
      .mockRejectedValueOnce(new APIError('forbidden', 403, null))
      .mockResolvedValueOnce();
    const getDeviceToken = vi.fn(() => 'old-token');
    const renewDeviceToken = vi.fn(async () => 'new-token');
    const { result } = renderHook(() =>
      useRecordingTurnUploaderV2({
        getDeviceToken,
        renewDeviceToken,
      }),
    );

    let outcome;
    await act(async () => {
      outcome = await result.current.upload(upload);
    });

    expect(outcome).toBe('uploaded');
    // 업로드한 턴의 세션 기준으로 토큰을 읽고 다시 받는다.
    expect(getDeviceToken).toHaveBeenCalledWith(upload.sessionKey);
    expect(renewDeviceToken).toHaveBeenCalledTimes(1);
    expect(renewDeviceToken).toHaveBeenCalledWith(upload.sessionKey);
    expect(vi.mocked(postRecordingTurnV2).mock.calls[1][2]).toBe('new-token');
  });

  it('이미 마감된 턴이나 끝난 세션이면 실패로 세지 않고 버린다', async () => {
    vi.mocked(postRecordingTurnV2).mockRejectedValue(
      new APIError('conflict', 409, null),
    );
    const { result } = renderHook(() =>
      useRecordingTurnUploaderV2({
        getDeviceToken: () => 'token',
        renewDeviceToken: vi.fn(),
      }),
    );

    let outcome;
    await act(async () => {
      outcome = await result.current.upload(upload);
    });

    expect(outcome).toBe('rejected');
    expect(result.current.failedCount).toBe(0);
  });

  it('그 밖의 오류나 재발급 실패는 실패로 센다', async () => {
    vi.mocked(postRecordingTurnV2).mockRejectedValue(
      new APIError('forbidden', 403, null),
    );
    const { result } = renderHook(() =>
      useRecordingTurnUploaderV2({
        getDeviceToken: () => 'token',
        renewDeviceToken: vi.fn(async () => {
          throw new Error('renew failed');
        }),
      }),
    );

    let outcome;
    await act(async () => {
      outcome = await result.current.upload(upload);
    });

    expect(outcome).toBe('failed');
    expect(result.current.failedCount).toBe(1);
  });

  it('기기 토큰이 없으면 먼저 새 토큰을 받는다', async () => {
    vi.mocked(postRecordingTurnV2).mockResolvedValue();
    const renewDeviceToken = vi.fn(async () => 'new-token');
    const { result } = renderHook(() =>
      useRecordingTurnUploaderV2({
        getDeviceToken: () => null,
        renewDeviceToken,
      }),
    );

    await act(async () => {
      await result.current.upload(upload);
    });

    expect(vi.mocked(postRecordingTurnV2).mock.calls[0][2]).toBe('new-token');
  });

  it('초기화하면 실패 수를 지운다', async () => {
    vi.mocked(postRecordingTurnV2).mockRejectedValue(new Error('network'));
    const { result } = renderHook(() =>
      useRecordingTurnUploaderV2({
        getDeviceToken: () => 'token',
        renewDeviceToken: vi.fn(),
      }),
    );
    await act(async () => {
      await result.current.upload(upload);
    });

    act(() => result.current.reset());

    expect(result.current.failedCount).toBe(0);
  });
});
