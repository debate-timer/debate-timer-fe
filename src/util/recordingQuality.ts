// 다기기 녹음 V2에서 한 구간을 녹음하는 동안 모은 프레임으로 서버에 보낼 품질 지표를 계산한다.
// 서버는 기기들이 보낸 지표로 같은 턴의 녹음 중 하나를 고른다.
import { RecordingQualityMetricsV2 } from '../types/recordingV2';
import {
  analyzeFrames,
  LevelFrame,
  measureFrame,
  SILENCE_DB,
  toDb,
} from './micLevel';

// 서버가 받는 가장 작은 dBFS 값. 소리가 전혀 없을 때(-Infinity)도 이 값으로 보낸다.
export const MIN_RECORDING_DB = -120;
// 배경 소음보다 이만큼 크지 않은 프레임은 말하지 않는 구간으로 본다.
const SPEECH_MARGIN_DB = 6;

export interface RecordingFrame extends LevelFrame {
  peakDb: number;
}

// 한 번 읽은 파형(-1~1)의 평균·최대 크기와 잘린 샘플 비율
export function measureRecordingFrame(samples: Float32Array): RecordingFrame {
  let peak = 0;
  for (const sample of samples) {
    peak = Math.max(peak, Math.abs(sample));
  }
  return { ...measureFrame(samples), peakDb: toDb(peak) };
}

// 말하는 구간과 쉬는 구간이 섞여 있다고 보고, 마이크 테스트와 같은 방식으로 말소리·배경 소음을 나눈다.
export function summarizeRecordingQuality(
  frames: RecordingFrame[],
): RecordingQualityMetricsV2 | null {
  if (frames.length === 0) {
    return null;
  }
  const { speechDb, noiseDb, snrDb, clippedRatio } = analyzeFrames(frames);
  const rmsDb = clampDb(averagePowerDb(frames));
  const peakDb = Math.max(
    rmsDb,
    clampDb(Math.max(...frames.map((frame) => frame.peakDb))),
  );
  const silenceThresholdDb = Math.max(SILENCE_DB, noiseDb + SPEECH_MARGIN_DB);
  const silentFrames = frames.filter(
    (frame) => !(frame.rmsDb >= silenceThresholdDb),
  ).length;

  return {
    rmsDb,
    peakDb,
    clippingRatio: clippedRatio,
    silenceRatio: silentFrames / frames.length,
    snrDb: speechDb > noiseDb ? snrDb : 0,
  };
}

// 프레임 dB를 그대로 평균내면 조용한 구간이 과하게 반영되므로 에너지로 평균낸다.
function averagePowerDb(frames: RecordingFrame[]): number {
  const power =
    frames.reduce(
      (sum, frame) =>
        sum + (Number.isFinite(frame.rmsDb) ? 10 ** (frame.rmsDb / 10) : 0),
      0,
    ) / frames.length;
  return power > 0 ? 10 * Math.log10(power) : -Infinity;
}

function clampDb(db: number): number {
  if (!Number.isFinite(db)) {
    return MIN_RECORDING_DB;
  }
  return Math.min(0, Math.max(MIN_RECORDING_DB, db));
}
