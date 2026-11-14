// 다기기 녹음 V2에서 한 구간(턴)을 녹음하고 품질을 재는 브라우저 경계.
import { RecordingQualityMetricsV2 } from '../types/recordingV2';
import {
  getRecorderMimeType,
  RECORDER_AUDIO_BITS_PER_SECOND,
  toAudioFileName,
} from './audioRecorder';
import { startRecordingQualityMeter } from './recordingQualityMeter';

// 이보다 짧은 구간은 오디오 머리 정보만 담겨 전사할 수 없으므로 보내지 않는다.
export const MIN_TURN_DURATION_MS = 1000;

export interface RecordedTurn {
  audio: Blob;
  fileName: string;
  // 녹음을 시작한 이 기기의 시각(epoch ms)
  startedAt: number;
  durationMs: number;
  metrics: RecordingQualityMetricsV2 | null;
}

export interface TurnRecording {
  // 녹음을 끝낸다. 오디오는 녹음기가 멈춘 뒤 onFinish로 넘어간다.
  stop: () => void;
  // 녹음을 버린다. onFinish를 부르지 않는다.
  cancel: () => void;
}

/**
 * 구간 녹음을 시작한다. 녹음기가 멈추면(stop 또는 마이크 분리) 한 번만 onFinish를 부르고,
 * 너무 짧거나 빈 녹음이면 null을 넘긴다.
 */
export function startTurnRecording(
  stream: MediaStream,
  onFinish: (turn: RecordedTurn | null) => void,
): TurnRecording {
  const mimeType = getRecorderMimeType();
  const recorder = new MediaRecorder(stream, {
    ...(mimeType ? { mimeType } : {}),
    audioBitsPerSecond: RECORDER_AUDIO_BITS_PER_SECOND,
  });
  const meter = startRecordingQualityMeter(stream);
  const startedAt = Date.now();
  // 시스템 시각 보정에 흔들리지 않도록 녹음 길이는 단조 시계로 잰다.
  const startedAtMonotonic = performance.now();
  const chunks: Blob[] = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };
  recorder.onstop = () => {
    const metrics = meter.stop();
    const durationMs = performance.now() - startedAtMonotonic;
    const type = recorder.mimeType || mimeType || 'audio/webm';
    const audio = new Blob(chunks, { type });
    if (audio.size === 0 || durationMs < MIN_TURN_DURATION_MS) {
      onFinish(null);
      return;
    }
    onFinish({
      audio,
      fileName: toAudioFileName(type),
      startedAt,
      durationMs,
      metrics,
    });
  };
  try {
    recorder.start();
  } catch (error) {
    meter.stop();
    throw error;
  }

  return {
    stop: () => {
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
    },
    cancel: () => {
      recorder.onstop = null;
      recorder.ondataavailable = null;
      meter.stop();
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
    },
  };
}
