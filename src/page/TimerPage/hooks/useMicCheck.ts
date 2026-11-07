import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getRecorderMimeType,
  isAudioRecordingSupported,
  RECORDER_AUDIO_BITS_PER_SECOND,
  requestMicrophoneStream,
  stopMediaStream,
} from '../../../util/audioRecorder';
import {
  analyzeFrames,
  LevelFrame,
  measureFrame,
  MicCheckResult,
  toMeterRatio,
} from '../../../util/micLevel';

// 테스트 녹음 길이. 한두 문장을 말하고 잠깐 쉬는 소리까지 담기는 길이다.
export const MIC_CHECK_DURATION_MS = 5000;
const ANALYSER_FFT_SIZE = 2048;

export type MicCheckStatus =
  'idle' | 'requesting' | 'ready' | 'recording' | 'done' | 'error';

export function isMicCheckSupported(): boolean {
  return isAudioRecordingSupported() && typeof AudioContext !== 'undefined';
}

/**
 * 토론 기록을 시작하기 전에 마이크를 서버로 보내지 않고 이 기기에서만 확인한다.
 * 입력 크기를 실시간으로 보여주고, 실제 기록과 같은 설정으로 짧게 녹음해 들어보고 품질을 판정한다.
 * 기록에 쓰는 마이크는 기록을 켤 때 따로 받으므로, 확인이 끝나면 마이크를 놓는다.
 */
export default function useMicCheck() {
  const [status, setStatus] = useState<MicCheckStatus>('idle');
  const [level, setLevel] = useState(0);
  const [remainingSec, setRemainingSec] = useState(0);
  const [result, setResult] = useState<MicCheckResult | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  // 테스트 녹음 중에만 프레임을 모은다.
  const framesRef = useRef<LevelFrame[] | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const recordingUrlRef = useRef<string | null>(null);
  // 확인을 시작하거나 끝낼 때마다 올린다. 마이크 권한을 기다리는 사이 바뀌었으면 받은 마이크를 놓는다.
  const generationRef = useRef(0);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    timersRef.current = [];
  }, []);

  const replaceRecordingUrl = useCallback((url: string | null) => {
    if (recordingUrlRef.current) {
      URL.revokeObjectURL(recordingUrlRef.current);
    }
    recordingUrlRef.current = url;
    setRecordingUrl(url);
  }, []);

  const release = useCallback(() => {
    generationRef.current += 1;
    clearTimers();
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    const recorder = recorderRef.current;
    recorderRef.current = null;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      recorder.stop();
    }
    framesRef.current = null;
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    replaceRecordingUrl(null);
  }, [clearTimers, replaceRecordingUrl]);

  const start = useCallback(async () => {
    if (!isMicCheckSupported()) {
      setStatus('error');
      return;
    }
    generationRef.current += 1;
    const generation = generationRef.current;
    setStatus('requesting');
    let stream: MediaStream;
    try {
      stream = await requestMicrophoneStream();
    } catch {
      if (generation === generationRef.current) {
        setStatus('error');
      }
      return;
    }
    // 권한을 묻는 사이 확인을 끝냈거나 다시 시작했으면 받은 마이크를 바로 놓는다.
    if (generation !== generationRef.current) {
      stopMediaStream(stream);
      return;
    }
    streamRef.current = stream;

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    void audioContext.resume();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = ANALYSER_FFT_SIZE;
    audioContext.createMediaStreamSource(stream).connect(analyser);
    const samples = new Float32Array(analyser.fftSize);

    const tick = () => {
      analyser.getFloatTimeDomainData(samples);
      const frame = measureFrame(samples);
      framesRef.current?.push(frame);
      setLevel(toMeterRatio(frame.rmsDb));
      animationFrameRef.current = requestAnimationFrame(tick);
    };
    animationFrameRef.current = requestAnimationFrame(tick);
    setStatus('ready');
  }, []);

  // 실제 기록과 같은 형식·비트레이트로 녹음해야 들어본 품질이 서버로 가는 품질과 같다.
  const record = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || recorderRef.current) {
      return;
    }
    const mimeType = getRecorderMimeType();
    const recorder = new MediaRecorder(stream, {
      ...(mimeType ? { mimeType } : {}),
      audioBitsPerSecond: RECORDER_AUDIO_BITS_PER_SECOND,
    });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    recorder.onstop = () => {
      recorderRef.current = null;
      const frames = framesRef.current ?? [];
      framesRef.current = null;
      const audio = new Blob(chunks, {
        type: recorder.mimeType || mimeType || 'audio/webm',
      });
      replaceRecordingUrl(URL.createObjectURL(audio));
      setResult(analyzeFrames(frames));
      setStatus('done');
    };

    clearTimers();
    framesRef.current = [];
    recorderRef.current = recorder;
    replaceRecordingUrl(null);
    setResult(null);
    recorder.start();
    setStatus('recording');

    const startedAt = Date.now();
    setRemainingSec(Math.ceil(MIC_CHECK_DURATION_MS / 1000));
    timersRef.current.push(
      setInterval(() => {
        const leftMs = MIC_CHECK_DURATION_MS - (Date.now() - startedAt);
        setRemainingSec(Math.max(0, Math.ceil(leftMs / 1000)));
      }, 250),
      setTimeout(() => {
        clearTimers();
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      }, MIC_CHECK_DURATION_MS),
    );
  }, [clearTimers, replaceRecordingUrl]);

  useEffect(() => release, [release]);

  return {
    status,
    level,
    remainingSec,
    result,
    recordingUrl,
    start,
    record,
    release,
  };
}
