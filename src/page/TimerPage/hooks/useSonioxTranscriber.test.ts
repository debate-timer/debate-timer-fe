import { act, renderHook, waitFor } from '@testing-library/react';
import { postSonioxTranscription } from '../../../apis/apis/stt';
import { APIError } from '../../../apis/primitives';
import {
  countPendingSegments,
  getTranscriptDraft,
} from '../../../util/transcriptDraft';
import useSonioxTranscriber, {
  UseSonioxTranscriberParams,
} from './useSonioxTranscriber';

// jsdom의 FormData·Blob 업로드는 MSW에서 끝나지 않아 API 함수 경계를 대체한다.
// 요청 형식은 src/apis/apis/stt.test.ts가 MSW로 검증한다.
vi.mock('../../../apis/apis/stt', () => ({
  postSonioxTranscription: vi.fn(),
}));
const mockedPost = vi.mocked(postSonioxTranscription);

class FakeMediaRecorder {
  static instances: FakeMediaRecorder[] = [];
  static isTypeSupported = vi.fn(() => true);
  // 실제 브라우저처럼 stop 이벤트를 나중에 보내려면 true로 둔다.
  static isStopDeferred = false;
  mimeType: string;
  state: 'inactive' | 'recording' = 'inactive';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  start = vi.fn(() => {
    this.state = 'recording';
  });
  stop = vi.fn(() => {
    this.state = 'inactive';
    if (!FakeMediaRecorder.isStopDeferred) {
      this.flush();
    }
  });

  flush(data: Blob = new Blob(['audio'], { type: this.mimeType })) {
    this.ondataavailable?.({ data });
    this.onstop?.();
  }

  constructor(
    public stream: MediaStream,
    options?: { mimeType?: string },
  ) {
    this.mimeType = options?.mimeType ?? 'audio/webm';
    FakeMediaRecorder.instances.push(this);
  }
}

const trackStop = vi.fn();
const fakeStream = { getTracks: () => [{ stop: trackStop }] };
const getUserMedia = vi.fn(async () => fakeStream);

const latest = () =>
  FakeMediaRecorder.instances[FakeMediaRecorder.instances.length - 1];

const baseParams: UseSonioxTranscriberParams = {
  tableId: 7,
  timeBoxIndex: 0,
  team: null,
  isRunning: false,
  lang: 'ko-KR',
};

const respondWith = (utterances: { offsetMs: number; text: string }[]) =>
  mockedPost.mockResolvedValue({ utterances });

describe('useSonioxTranscriber', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockedPost.mockReset();
    FakeMediaRecorder.instances = [];
    FakeMediaRecorder.isStopDeferred = false;
    trackStop.mockClear();
    getUserMedia.mockClear();
    vi.stubGlobal('MediaRecorder', FakeMediaRecorder);
    vi.stubGlobal('navigator', {
      ...navigator,
      mediaDevices: { getUserMedia },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('기록을 켜면 마이크 권한을 받고 Soniox 모드 초안을 시작하지만 타이머가 멈춰 있으면 녹음하지 않는다', async () => {
    const { result } = renderHook(() => useSonioxTranscriber(baseParams));

    await act(() => result.current.enable());

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(result.current.isEnabled).toBe(true);
    expect(result.current.isListening).toBe(false);
    expect(FakeMediaRecorder.instances).toHaveLength(0);
    expect(getTranscriptDraft(7)?.sttMode).toBe('SONIOX');
  });

  it('타이머가 도는 동안 녹음하고 멈추면 구간 오디오를 전사해 기록 시작 기준 시각으로 저장한다', async () => {
    respondWith([{ offsetMs: 500, text: '찬성 입론입니다.' }]);
    const { result, rerender } = renderHook(
      (params) => useSonioxTranscriber(params),
      { initialProps: baseParams },
    );
    await act(() => result.current.enable());

    rerender({ ...baseParams, isRunning: true });
    expect(latest().start).toHaveBeenCalled();
    expect(result.current.isListening).toBe(true);

    rerender({ ...baseParams, isRunning: false });

    expect(latest().stop).toHaveBeenCalled();
    await waitFor(() => expect(result.current.utteranceCount).toBe(1));
    const draft = getTranscriptDraft(7)!;
    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect(mockedPost).toHaveBeenCalledWith(
      expect.any(Blob),
      'segment.webm',
      'ko-KR',
    );
    expect(draft.segments).toEqual([
      expect.objectContaining({
        timeBoxIndex: 0,
        team: null,
        utterances: [
          { offsetMs: expect.any(Number), text: '찬성 입론입니다.' },
        ],
      }),
    ]);
    expect(draft.segments[0].utterances[0].offsetMs).toBeGreaterThanOrEqual(
      500,
    );
    expect(countPendingSegments(draft, Date.now())).toBe(0);
    expect(result.current.pendingCount).toBe(0);
  });

  it('자유토론 팀이 바뀌면 이전 팀 구간을 끝내고 새 구간 녹음을 시작한다', async () => {
    respondWith([{ offsetMs: 0, text: '발언' }]);
    const running = { ...baseParams, isRunning: true, team: 'PROS' as const };
    const { result, rerender } = renderHook(
      (params) => useSonioxTranscriber(params),
      { initialProps: baseParams },
    );
    await act(() => result.current.enable());
    rerender(running);
    const prosRecorder = latest();

    rerender({ ...running, team: 'CONS' });

    expect(prosRecorder.stop).toHaveBeenCalled();
    expect(FakeMediaRecorder.instances).toHaveLength(2);
    expect(latest().start).toHaveBeenCalled();
    await waitFor(() =>
      expect(getTranscriptDraft(7)?.segments.map(({ team }) => team)).toEqual([
        'PROS',
      ]),
    );
  });

  it('전사 요청이 실패하면 대기에서 빼고 실패 구간 수를 센다', async () => {
    mockedPost.mockRejectedValue(
      new APIError('음성 인식 요청에 실패했습니다', 502, null),
    );
    const { result, rerender } = renderHook(
      (params) => useSonioxTranscriber(params),
      { initialProps: baseParams },
    );
    await act(() => result.current.enable());
    rerender({ ...baseParams, isRunning: true });

    rerender({ ...baseParams, isRunning: false });

    await waitFor(() => expect(result.current.failedCount).toBe(1));
    expect(result.current.pendingCount).toBe(0);
    expect(getTranscriptDraft(7)?.failedSegmentCount).toBe(1);
  });

  it('마이크 권한을 거부하면 기록을 켜지 않고 권한 오류를 알린다', async () => {
    getUserMedia.mockRejectedValueOnce(
      new DOMException('denied', 'NotAllowedError'),
    );
    const { result } = renderHook(() => useSonioxTranscriber(baseParams));

    await act(() => result.current.enable());

    expect(result.current.isEnabled).toBe(false);
    expect(result.current.error).toBe('not-allowed');
  });

  it('녹음을 지원하지 않는 브라우저면 지원 안 함으로 알린다', async () => {
    vi.stubGlobal('MediaRecorder', undefined);
    const { result } = renderHook(() => useSonioxTranscriber(baseParams));

    expect(result.current.isSupported).toBe(false);
    await act(() => result.current.enable());

    expect(result.current.error).toBe('unsupported');
  });

  it('기록을 끄면 녹음 중이던 구간을 마무리하고 마이크를 놓는다', async () => {
    respondWith([]);
    const { result, rerender } = renderHook(
      (params) => useSonioxTranscriber(params),
      { initialProps: baseParams },
    );
    await act(() => result.current.enable());
    rerender({ ...baseParams, isRunning: true });
    const recorder = latest();

    act(() => result.current.disable());

    expect(recorder.stop).toHaveBeenCalled();
    expect(trackStop).toHaveBeenCalled();
    expect(result.current.isListening).toBe(false);
  });

  it('구간을 끝내는 즉시 전사 대기로 기록해 녹음 마무리 전에 종료 화면으로 가도 기다리게 한다', async () => {
    respondWith([{ offsetMs: 0, text: '마지막 발언' }]);
    FakeMediaRecorder.isStopDeferred = true;
    const { result, rerender, unmount } = renderHook(
      (params) => useSonioxTranscriber(params),
      { initialProps: baseParams },
    );
    await act(() => result.current.enable());
    rerender({ ...baseParams, isRunning: true });
    const recorder = latest();

    unmount();

    expect(countPendingSegments(getTranscriptDraft(7)!, Date.now())).toBe(1);
    recorder.flush();
    await waitFor(() =>
      expect(getTranscriptDraft(7)?.segments).toHaveLength(1),
    );
    expect(countPendingSegments(getTranscriptDraft(7)!, Date.now())).toBe(0);
  });

  it('녹음된 오디오가 없으면 전사하지 않고 대기에서 뺀다', async () => {
    FakeMediaRecorder.isStopDeferred = true;
    const { result, rerender } = renderHook(
      (params) => useSonioxTranscriber(params),
      { initialProps: baseParams },
    );
    await act(() => result.current.enable());
    rerender({ ...baseParams, isRunning: true });
    const recorder = latest();
    rerender({ ...baseParams, isRunning: false });

    act(() => recorder.flush(new Blob([])));

    expect(mockedPost).not.toHaveBeenCalled();
    expect(countPendingSegments(getTranscriptDraft(7)!, Date.now())).toBe(0);
    expect(result.current.pendingCount).toBe(0);
  });
});
