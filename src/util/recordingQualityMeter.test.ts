import { startRecordingQualityMeter } from './recordingQualityMeter';

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
  source = { connect: vi.fn(), disconnect: vi.fn() };
  createAnalyser = () => new FakeAnalyser();
  createMediaStreamSource = () => this.source;
  constructor() {
    FakeAudioContext.instances.push(this);
  }
}

const stream = {} as MediaStream;

describe('녹음 품질 측정기', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    currentAmplitude = 0;
    FakeAudioContext.instances = [];
    vi.stubGlobal('AudioContext', FakeAudioContext);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('녹음하는 동안 잰 크기로 구간 품질 지표를 만든다', () => {
    const meter = startRecordingQualityMeter(stream);
    currentAmplitude = 0.1;
    vi.advanceTimersByTime(1_000);
    currentAmplitude = 0.001;
    vi.advanceTimersByTime(1_000);

    const metrics = meter.stop();

    expect(metrics).not.toBeNull();
    expect(metrics!.peakDb).toBeCloseTo(-20, 0);
    expect(metrics!.snrDb).toBeCloseTo(40, 0);
    expect(metrics!.silenceRatio).toBeCloseTo(0.5, 1);
  });

  it('멈추면 분석기 연결과 오디오 컨텍스트를 정리하고 더 재지 않는다', () => {
    const meter = startRecordingQualityMeter(stream);
    vi.advanceTimersByTime(500);
    meter.stop();
    const context = FakeAudioContext.instances[0];

    expect(context.source.disconnect).toHaveBeenCalled();
    expect(context.close).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('Web Audio를 쓸 수 없으면 지표 없이 끝낸다', () => {
    vi.stubGlobal('AudioContext', undefined);

    expect(startRecordingQualityMeter(stream).stop()).toBeNull();
  });

  it('잰 프레임이 없으면 지표 없이 끝낸다', () => {
    expect(startRecordingQualityMeter(stream).stop()).toBeNull();
  });
});
