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

  describe('여러 업로드가 함께 403을 받으면', () => {
    const forbidden = () => new APIError('forbidden', 403, null);
    let storedToken: string;
    let validToken: string;

    beforeEach(() => {
      storedToken = 'old-token';
      validToken = 'new-token';
      vi.mocked(postRecordingTurnV2).mockImplementation(
        async (_sessionKey, _turnKey, deviceToken) => {
          if (deviceToken !== validToken) {
            throw forbidden();
          }
        },
      );
    });

    // 저장소처럼 재참가로 받은 토큰을 기억한다. 재참가 응답은 다음 작업 차례에 와서 두 업로드가 모두 기다리게 한다.
    const renderUploader = (renew: () => Promise<string>) =>
      renderHook(() =>
        useRecordingTurnUploaderV2({
          getDeviceToken: () => storedToken,
          renewDeviceToken: vi.fn(async () => {
            storedToken = await renew();
            return storedToken;
          }),
        }),
      );
    const later = <T>(value: () => T) =>
      new Promise<T>((resolve, reject) =>
        setTimeout(() => {
          try {
            resolve(value());
          } catch (error) {
            reject(error);
          }
        }, 0),
      );

    it('재참가는 한 번만 하고 두 업로드 모두 새 토큰으로 다시 올린다', async () => {
      const renew = vi.fn(() => later(() => 'new-token'));
      const { result } = renderUploader(renew);

      let outcomes: string[] = [];
      await act(async () => {
        outcomes = await Promise.all([
          result.current.upload(upload),
          result.current.upload({ ...upload, turnKey: '0-2' }),
        ]);
      });

      expect(outcomes).toEqual(['uploaded', 'uploaded']);
      expect(renew).toHaveBeenCalledTimes(1);
      const retriedTokens = vi
        .mocked(postRecordingTurnV2)
        .mock.calls.slice(2)
        .map((call) => call[2]);
      expect(retriedTokens).toEqual(['new-token', 'new-token']);
    });

    it('다른 업로드가 이미 새 토큰을 받았으면 재참가하지 않고 그 토큰으로 다시 올린다', async () => {
      vi.mocked(postRecordingTurnV2).mockImplementationOnce(async () => {
        // 이 요청이 거절되기 전에 다른 업로드가 재참가를 마쳤다.
        storedToken = 'new-token';
        throw forbidden();
      });
      const renew = vi.fn(async () => 'another-token');
      const { result } = renderUploader(renew);

      let outcome;
      await act(async () => {
        outcome = await result.current.upload(upload);
      });

      expect(outcome).toBe('uploaded');
      expect(renew).not.toHaveBeenCalled();
      expect(vi.mocked(postRecordingTurnV2).mock.calls[1][2]).toBe('new-token');
    });

    it('함께 기다린 재참가가 실패하면 두 업로드 모두 같은 결과로 끝난다', async () => {
      const renew = vi.fn(() =>
        later<string>(() => {
          throw new APIError('conflict', 409, null);
        }),
      );
      const { result } = renderUploader(renew);

      let outcomes: string[] = [];
      await act(async () => {
        outcomes = await Promise.all([
          result.current.upload(upload),
          result.current.upload({ ...upload, turnKey: '0-2' }),
        ]);
      });

      expect(outcomes).toEqual(['rejected', 'rejected']);
      expect(renew).toHaveBeenCalledTimes(1);
      expect(result.current.failedCount).toBe(0);
    });

    it('재참가가 끝난 뒤 다시 403을 받으면 새로 재참가한다', async () => {
      let issued = 0;
      const renew = vi.fn(async () => `new-token-${++issued}`);
      validToken = 'new-token-1';
      const { result } = renderUploader(renew);
      await act(async () => {
        await result.current.upload(upload);
      });

      // 서버가 다시 재시작되어 받은 토큰도 잊었다.
      validToken = 'new-token-2';
      let outcome;
      await act(async () => {
        outcome = await result.current.upload({ ...upload, turnKey: '0-2' });
      });

      expect(outcome).toBe('uploaded');
      expect(renew).toHaveBeenCalledTimes(2);
    });
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
