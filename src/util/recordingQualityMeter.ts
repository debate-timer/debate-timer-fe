// 녹음 중인 마이크 입력에 분석기를 붙여, 구간이 끝날 때 품질 지표를 돌려주는 브라우저 경계.
// 화면이 꺼지거나 탭이 가려져도 측정이 이어지도록 requestAnimationFrame 대신 타이머로 잰다.
import { RecordingQualityMetricsV2 } from '../types/recordingV2';
import {
  measureRecordingFrame,
  RecordingFrame,
  summarizeRecordingQuality,
} from './recordingQuality';

const ANALYSER_FFT_SIZE = 2048;
const SAMPLE_INTERVAL_MS = 100;

export interface RecordingQualityMeter {
  // 측정을 멈추고 지표를 돌려준다. Web Audio를 쓸 수 없거나 잰 프레임이 없으면 null이다.
  stop: () => RecordingQualityMetricsV2 | null;
}

export function startRecordingQualityMeter(
  stream: MediaStream,
): RecordingQualityMeter {
  if (typeof AudioContext === 'undefined') {
    return { stop: () => null };
  }
  // 생성 한도 초과 등으로 Web Audio를 열지 못해도 녹음은 이어 가고 품질 지표만 뺀다.
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode;
  let source: MediaStreamAudioSourceNode;
  try {
    audioContext = new AudioContext();
    void audioContext.resume();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = ANALYSER_FFT_SIZE;
    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
  } catch {
    void audioContext?.close().catch(() => undefined);
    return { stop: () => null };
  }
  const context = audioContext;
  const samples = new Float32Array(analyser.fftSize);
  const frames: RecordingFrame[] = [];
  const intervalId = setInterval(() => {
    analyser.getFloatTimeDomainData(samples);
    frames.push(measureRecordingFrame(samples));
  }, SAMPLE_INTERVAL_MS);

  return {
    stop: () => {
      clearInterval(intervalId);
      source.disconnect();
      void context.close();
      return summarizeRecordingQuality(frames);
    },
  };
}
