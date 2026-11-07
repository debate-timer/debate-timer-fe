import { act, renderHook } from '@testing-library/react';
import useMicCheck, { MIC_CHECK_DURATION_MS } from './useMicCheck';

// 분석기가 돌려줄 파형 크기. 테스트에서 말소리와 쉬는 소리를 바꿔 넣는다.
let currentAmplitude = 0;

class FakeAnalyser {
  fftSize = 0;
  getFloatTimeDomainData(samples: Float32Array) {
    samples.fill(currentAmplitude);
  }
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];
  resume = vi.fn(async () => {});
  close = vi.fn(async () => {});
  createAnalyser = () => new FakeAnalyser();
  createMediaStreamSource = () => ({ connect: vi.fn() });
  constructor() {
    FakeAudioContext.instances.push(this);
  }
}

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
      data: new Blob(['audio'], { type: this.mimeType }),
    });
    this.onstop?.();
  });
  constructor(
    public stream: MediaStream,
    public options?: { mimeType?: string; audioBitsPerSecond?: number },
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

// 화면 갱신 한 번마다 쌓인 콜백을 실행한다.
let frameCallbacks: FrameRequestCallback[] = [];
const runFrames = (count: number) => {
  for (let i = 0; i < count; i += 1) {
    const callbacks = frameCallbacks;
    frameCallbacks = [];
    callbacks.forEach((callback) => callback(0));
  }
};

describe('마이크 테스트 훅', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    currentAmplitude = 0;
    frameCallbacks = [];
    FakeAudioContext.instances = [];
    FakeMediaRecorder.instances = [];
    trackStop.mockClear();
    getUserMedia.mockClear();
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('MediaRecorder', FakeMediaRecorder);
    vi.stubGlobal('navigator', {
      ...navigator,
      mediaDevices: { getUserMedia },
    });
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frameCallbacks.push(callback);
      return frameCallbacks.length;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:mic-check'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('시작하면 마이크를 받아 입력 크기를 실시간으로 보여준다', async () => {
    const { result } = renderHook(() => useMicCheck());

    await act(() => result.current.start());
    expect(result.current.status).toBe('ready');

    currentAmplitude = 0.1; // -20dB
    act(() => runFrames(1));

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(result.current.level).toBeCloseTo(2 / 3);
  });

  it('실제 기록과 같은 설정으로 정해진 시간만큼 녹음한 뒤 들어볼 수 있게 하고 품질을 판정한다', async () => {
    const { result } = renderHook(() => useMicCheck());
    await act(() => result.current.start());

    act(() => result.current.record());
    expect(result.current.status).toBe('recording');
    expect(FakeMediaRecorder.instances[0].options).toEqual({
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 32_000,
    });

    currentAmplitude = 0.1; // 말소리 -20dB
    act(() => runFrames(50));
    currentAmplitude = 0.001; // 쉬는 소리 -60dB
    act(() => runFrames(50));
    act(() => vi.advanceTimersByTime(MIC_CHECK_DURATION_MS));

    expect(result.current.status).toBe('done');
    expect(result.current.recordingUrl).toBe('blob:mic-check');
    expect(result.current.result?.verdict).toBe('good');
    expect(result.current.result?.speechDb).toBeCloseTo(-20);
  });

  it('녹음 중에는 남은 시간을 초 단위로 줄여 보여준다', async () => {
    const { result } = renderHook(() => useMicCheck());
    await act(() => result.current.start());

    act(() => result.current.record());
    expect(result.current.remainingSec).toBe(MIC_CHECK_DURATION_MS / 1000);

    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.remainingSec).toBe(MIC_CHECK_DURATION_MS / 1000 - 2);
  });

  it('마이크 권한을 거부하면 오류 상태가 된다', async () => {
    getUserMedia.mockRejectedValueOnce(new Error('denied'));
    const { result } = renderHook(() => useMicCheck());

    await act(() => result.current.start());

    expect(result.current.status).toBe('error');
  });

  it('화면이 닫히면 녹음을 멈추고 마이크와 오디오 처리, 녹음 주소를 정리한다', async () => {
    const { result, unmount } = renderHook(() => useMicCheck());
    await act(() => result.current.start());
    act(() => result.current.record());

    unmount();

    expect(FakeMediaRecorder.instances[0].stop).toHaveBeenCalled();
    expect(trackStop).toHaveBeenCalled();
    expect(FakeAudioContext.instances[0].close).toHaveBeenCalled();
  });

  it('마이크 권한을 기다리는 사이 화면이 닫히면 나중에 받은 마이크를 바로 놓는다', async () => {
    const lateStream = {
      active: true,
      getTracks: () => [{ stop: trackStop }],
    };
    let grant: () => void = () => {};
    getUserMedia.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          grant = () => resolve(lateStream);
        }),
    );
    const { result, unmount } = renderHook(() => useMicCheck());
    let started: Promise<void> = Promise.resolve();
    act(() => {
      started = result.current.start();
    });

    unmount();
    grant();
    await started;

    expect(trackStop).toHaveBeenCalled();
    expect(FakeAudioContext.instances).toHaveLength(0);
  });
});
