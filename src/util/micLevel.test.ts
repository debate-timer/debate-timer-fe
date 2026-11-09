import {
  analyzeFrames,
  LevelFrame,
  measureFrame,
  smoothMeterLevel,
  toDb,
  toMeterRatio,
} from './micLevel';

// 크기가 amplitude인 사인파 한 주기 분량
const sine = (amplitude: number, length = 1024) =>
  Float32Array.from(
    { length },
    (_, i) => Math.sin((2 * Math.PI * i) / length) * amplitude,
  );

const frames = (rmsDb: number, count: number, clippedRatio = 0): LevelFrame[] =>
  Array.from({ length: count }, () => ({ rmsDb, clippedRatio }));

// 말하는 구간(speechDb)과 쉬는 구간(noiseDb)이 반씩 섞인 녹음
const speechWithPauses = (speechDb: number, noiseDb: number) => [
  ...frames(speechDb, 50),
  ...frames(noiseDb, 50),
];

describe('마이크 입력 크기 계산', () => {
  it('파형의 크기를 dBFS로 잰다', () => {
    // 사인파의 RMS는 진폭 / √2 이므로 진폭 1이면 약 -3dB
    expect(measureFrame(sine(1)).rmsDb).toBeCloseTo(-3.01, 1);
    expect(measureFrame(sine(0.1)).rmsDb).toBeCloseTo(-23.01, 1);
    expect(measureFrame(new Float32Array(1024)).rmsDb).toBe(-Infinity);
  });

  it('최대치에 닿은 샘플 비율을 잘린 비율로 센다', () => {
    const samples = new Float32Array([1, -1, 0.5, 0]);

    expect(measureFrame(samples).clippedRatio).toBe(0.5);
  });

  it('막대 비율은 -60dB 이하를 0, 0dB를 1로 본다', () => {
    expect(toMeterRatio(-Infinity)).toBe(0);
    expect(toMeterRatio(-70)).toBe(0);
    expect(toMeterRatio(-30)).toBeCloseTo(0.5);
    expect(toMeterRatio(toDb(1))).toBe(1);
  });
});

describe('마이크 테스트 품질 판정', () => {
  it('말소리가 충분히 크고 소음과 차이가 크면 좋음으로 본다', () => {
    const result = analyzeFrames(speechWithPauses(-20, -55));

    expect(result.verdict).toBe('good');
    expect(result.speechDb).toBe(-20);
    expect(result.noiseDb).toBe(-55);
    expect(result.snrDb).toBe(35);
  });

  it('소리가 거의 없으면 입력 없음으로 본다', () => {
    expect(analyzeFrames(frames(-80, 100)).verdict).toBe('silent');
    expect(analyzeFrames([]).verdict).toBe('silent');
  });

  it('말소리가 작으면 작음으로 본다', () => {
    expect(analyzeFrames(speechWithPauses(-40, -70)).verdict).toBe('quiet');
  });

  it('잘린 샘플이 많으면 소리가 크다고 본다', () => {
    const result = analyzeFrames([...frames(-1, 50, 0.05), ...frames(-50, 50)]);

    expect(result.verdict).toBe('clipping');
  });

  it('말소리와 배경 소음의 차이가 작으면 소음이 크다고 본다', () => {
    expect(analyzeFrames(speechWithPauses(-20, -30)).verdict).toBe('noisy');
  });
});

describe('마이크 막대 움직임', () => {
  it('커질 때는 빠르게, 작아질 때는 천천히 따라간다', () => {
    const rise = smoothMeterLevel(0, 1, 16);
    const fall = 1 - smoothMeterLevel(1, 0, 16);

    expect(rise).toBeGreaterThan(0);
    expect(rise).toBeLessThan(1);
    expect(fall).toBeGreaterThan(0);
    expect(rise).toBeGreaterThan(fall * 2);
  });

  it('시간이 충분히 지나면 측정한 크기에 닿는다', () => {
    expect(smoothMeterLevel(0, 0.5, 2000)).toBeCloseTo(0.5);
    expect(smoothMeterLevel(1, 0.2, 2000)).toBeCloseTo(0.2);
  });

  it.each([0, -16, Number.NaN])(
    '프레임 간격이 %s이면 이전 크기를 유지한다',
    (elapsedMs) => {
      expect(smoothMeterLevel(0.3, 1, elapsedMs)).toBe(0.3);
    },
  );
});
