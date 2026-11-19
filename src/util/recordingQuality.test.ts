import {
  measureRecordingFrame,
  RecordingFrame,
  summarizeRecordingQuality,
} from './recordingQuality';

const sine = (amplitude: number, length = 1024) =>
  Float32Array.from(
    { length },
    (_, i) => Math.sin((2 * Math.PI * i) / length) * amplitude,
  );

const frames = (
  rmsDb: number,
  count: number,
  { peakDb = rmsDb + 3, clippedRatio = 0 } = {},
): RecordingFrame[] =>
  Array.from({ length: count }, () => ({ rmsDb, peakDb, clippedRatio }));

describe('녹음 구간 품질 지표', () => {
  describe('프레임 측정', () => {
    it('평균 크기와 함께 가장 큰 순간 크기를 dBFS로 잰다', () => {
      const frame = measureRecordingFrame(sine(0.5));

      expect(frame.rmsDb).toBeCloseTo(-9.03, 1);
      expect(frame.peakDb).toBeCloseTo(-6.02, 1);
      expect(frame.clippedRatio).toBe(0);
    });

    it('소리가 없으면 크기를 -Infinity로 잰다', () => {
      const frame = measureRecordingFrame(new Float32Array(16));

      expect(frame.rmsDb).toBe(-Infinity);
      expect(frame.peakDb).toBe(-Infinity);
    });
  });

  describe('구간 요약', () => {
    it('말소리와 쉬는 구간이 섞인 녹음의 지표를 계산한다', () => {
      const metrics = summarizeRecordingQuality([
        ...frames(-20, 60, { peakDb: -5 }),
        ...frames(-50, 40, { peakDb: -45 }),
      ]);

      expect(metrics).not.toBeNull();
      expect(metrics!.rmsDb).toBeCloseTo(-22.2, 1);
      expect(metrics!.peakDb).toBe(-5);
      expect(metrics!.snrDb).toBe(30);
      expect(metrics!.silenceRatio).toBe(0.4);
      expect(metrics!.clippingRatio).toBe(0);
    });

    it('잘린 샘플 비율은 프레임 평균이다', () => {
      const metrics = summarizeRecordingQuality([
        ...frames(-10, 1, { peakDb: 0, clippedRatio: 0.2 }),
        ...frames(-10, 1, { peakDb: 0, clippedRatio: 0 }),
      ]);

      expect(metrics!.clippingRatio).toBe(0.1);
    });

    it('소리가 전혀 없으면 서버가 받는 최소값으로 맞춘다', () => {
      const metrics = summarizeRecordingQuality(frames(-Infinity, 10));

      expect(metrics).toEqual({
        rmsDb: -120,
        peakDb: -120,
        clippingRatio: 0,
        silenceRatio: 1,
        snrDb: 0,
      });
    });

    it('최대 순간 크기는 평균 크기보다 작아지지 않는다', () => {
      const metrics = summarizeRecordingQuality(
        frames(-20, 10, { peakDb: -Infinity }),
      );

      expect(metrics!.peakDb).toBeGreaterThanOrEqual(metrics!.rmsDb);
    });

    it('모은 프레임이 없으면 지표를 만들지 않는다', () => {
      expect(summarizeRecordingQuality([])).toBeNull();
    });
  });
});
