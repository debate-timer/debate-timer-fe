import { RecordedTurn, startTurnRecording } from './turnRecording';

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
    this.ondataavailable?.({
      data: new Blob([new Uint8Array(this.size)], { type: this.mimeType }),
    });
    this.onstop?.();
  });
  size = 3;
  constructor(
    public stream: MediaStream,
    public options?: { mimeType?: string; audioBitsPerSecond?: number },
  ) {
    this.mimeType = options?.mimeType ?? 'audio/webm';
    FakeMediaRecorder.instances.push(this);
  }
}

const stream = {} as MediaStream;

describe('구간 녹음', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(10_000);
    FakeMediaRecorder.instances = [];
    vi.stubGlobal('MediaRecorder', FakeMediaRecorder);
    // 품질 측정은 별도로 검증하므로 여기서는 Web Audio가 없는 환경으로 둔다.
    vi.stubGlobal('AudioContext', undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('멈추면 녹음한 오디오와 길이를 넘긴다', () => {
    const onFinish = vi.fn<(turn: RecordedTurn | null) => void>();
    const recording = startTurnRecording(stream, onFinish);
    vi.advanceTimersByTime(5_000);

    recording.stop();

    const turn = onFinish.mock.calls[0][0];
    expect(turn?.audio.size).toBe(3);
    expect(turn?.fileName).toBe('segment.webm');
    expect(turn?.durationMs).toBe(5_000);
    expect(turn?.startedAt).toBe(10_000);
    expect(turn?.metrics).toBeNull();
  });

  it('녹음기가 스스로 멈춰도 오디오를 넘긴다', () => {
    const onFinish = vi.fn();
    startTurnRecording(stream, onFinish);
    vi.advanceTimersByTime(2_000);

    FakeMediaRecorder.instances[0].stop();

    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish.mock.calls[0][0]).not.toBeNull();
  });

  it('1초보다 짧은 구간은 오디오 없이 끝낸다', () => {
    const onFinish = vi.fn();
    const recording = startTurnRecording(stream, onFinish);
    vi.advanceTimersByTime(500);

    recording.stop();

    expect(onFinish).toHaveBeenCalledWith(null);
  });

  it('빈 오디오는 오디오 없이 끝낸다', () => {
    const onFinish = vi.fn();
    const recording = startTurnRecording(stream, onFinish);
    FakeMediaRecorder.instances[0].size = 0;
    vi.advanceTimersByTime(2_000);

    recording.stop();

    expect(onFinish).toHaveBeenCalledWith(null);
  });

  it('취소하면 녹음을 멈추고 아무것도 넘기지 않는다', () => {
    const onFinish = vi.fn();
    const recording = startTurnRecording(stream, onFinish);
    vi.advanceTimersByTime(2_000);

    recording.cancel();

    expect(FakeMediaRecorder.instances[0].state).toBe('inactive');
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('녹음 중 시스템 시각이 바뀌어도 녹음 길이는 실제 경과 시간이다', () => {
    const onFinish = vi.fn<(turn: RecordedTurn | null) => void>();
    const recording = startTurnRecording(stream, onFinish);
    vi.advanceTimersByTime(5_000);
    vi.setSystemTime(Date.now() - 60_000);

    recording.stop();

    expect(onFinish.mock.calls[0][0]?.durationMs).toBe(5_000);
  });

  it('녹음기를 시작하지 못하면 품질 측정을 정리하고 예외를 그대로 던진다', () => {
    const close = vi.fn(async () => {});
    vi.stubGlobal(
      'AudioContext',
      class {
        resume = vi.fn(async () => {});
        close = close;
        createAnalyser = () => ({
          fftSize: 0,
          getFloatTimeDomainData: vi.fn(),
        });
        createMediaStreamSource = () => ({
          connect: vi.fn(),
          disconnect: vi.fn(),
        });
      },
    );
    const error = new DOMException('unsupported', 'NotSupportedError');
    vi.stubGlobal(
      'MediaRecorder',
      class extends FakeMediaRecorder {
        start = vi.fn(() => {
          throw error;
        });
      },
    );

    expect(() => startTurnRecording(stream, vi.fn())).toThrow(error);
    expect(close).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
