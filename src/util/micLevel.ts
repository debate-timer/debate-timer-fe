// 마이크 테스트에서 입력 크기를 재고 녹음 품질을 판정하는 순수 계산.
// 값은 dBFS(디지털 최대치 0 기준)라 기기마다 조금씩 다르므로 판정은 안내용 기준이다.

// 이보다 작으면 사실상 소리가 들어오지 않는 것으로 본다.
export const SILENCE_DB = -60;
// 말소리가 이보다 작으면 전사가 단어를 놓치기 쉽다.
export const QUIET_SPEECH_DB = -35;
// 이 값 이상인 샘플은 잘린(클리핑) 것으로 본다.
export const CLIPPING_SAMPLE = 0.99;
// 클리핑된 샘플이 이 비율을 넘으면 소리가 찌그러진다.
export const CLIPPING_RATIO = 0.01;
// 말소리와 배경 소음의 차이가 이보다 작으면 소음이 전사를 방해한다.
export const MIN_SNR_DB = 15;

// 화면 막대에서 0%로 보이는 최소 크기
const METER_FLOOR_DB = -60;

export type MicVerdict = 'silent' | 'quiet' | 'clipping' | 'noisy' | 'good';

export interface LevelFrame {
  rmsDb: number;
  clippedRatio: number;
}

export interface MicCheckResult {
  verdict: MicVerdict;
  // 말할 때 크기 (프레임 크기 상위 10%)
  speechDb: number;
  // 배경 소음 크기 (프레임 크기 하위 10%)
  noiseDb: number;
  snrDb: number;
  clippedRatio: number;
}

export function toDb(amplitude: number): number {
  return amplitude > 0 ? 20 * Math.log10(amplitude) : -Infinity;
}

// 한 번 읽은 파형(-1~1)의 크기와 잘린 샘플 비율
export function measureFrame(samples: Float32Array): LevelFrame {
  if (samples.length === 0) {
    return { rmsDb: -Infinity, clippedRatio: 0 };
  }
  let sumOfSquares = 0;
  let clipped = 0;
  for (const sample of samples) {
    sumOfSquares += sample * sample;
    if (Math.abs(sample) >= CLIPPING_SAMPLE) {
      clipped += 1;
    }
  }
  return {
    rmsDb: toDb(Math.sqrt(sumOfSquares / samples.length)),
    clippedRatio: clipped / samples.length,
  };
}

// 실시간 막대에 쓰는 0~1 값
export function toMeterRatio(rmsDb: number): number {
  if (!Number.isFinite(rmsDb) || rmsDb <= METER_FLOOR_DB) {
    return 0;
  }
  return Math.min(1, (rmsDb - METER_FLOOR_DB) / -METER_FLOOR_DB);
}

function percentile(sorted: number[], ratio: number): number {
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.round((sorted.length - 1) * ratio)),
  );
  return sorted[index];
}

// 테스트 녹음 동안 모은 프레임으로 녹음 품질을 판정한다.
// 말하는 구간과 쉬는 구간이 섞여 있다고 보고, 큰 쪽을 말소리, 작은 쪽을 배경 소음으로 쓴다.
export function analyzeFrames(frames: LevelFrame[]): MicCheckResult {
  const levels = frames
    .map((frame) => (Number.isFinite(frame.rmsDb) ? frame.rmsDb : -100))
    .sort((a, b) => a - b);
  const speechDb = levels.length > 0 ? percentile(levels, 0.9) : -100;
  const noiseDb = levels.length > 0 ? percentile(levels, 0.1) : -100;
  const snrDb = speechDb - noiseDb;
  const clippedRatio =
    frames.length > 0
      ? frames.reduce((sum, frame) => sum + frame.clippedRatio, 0) /
        frames.length
      : 0;

  return {
    verdict: judge(speechDb, snrDb, clippedRatio),
    speechDb,
    noiseDb,
    snrDb,
    clippedRatio,
  };
}

function judge(
  speechDb: number,
  snrDb: number,
  clippedRatio: number,
): MicVerdict {
  if (speechDb < SILENCE_DB) {
    return 'silent';
  }
  if (clippedRatio > CLIPPING_RATIO) {
    return 'clipping';
  }
  if (speechDb < QUIET_SPEECH_DB) {
    return 'quiet';
  }
  if (snrDb < MIN_SNR_DB) {
    return 'noisy';
  }
  return 'good';
}
