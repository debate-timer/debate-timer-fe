// MediaRecorder 기반 발언 구간 녹음의 브라우저 경계.

// 음성 전사에 충분한 품질로, 몇 분 길이 구간도 수 MB 안에 들도록 낮춘 비트레이트
export const RECORDER_AUDIO_BITS_PER_SECOND = 32_000;

// Soniox가 받는 형식 중 브라우저가 녹음할 수 있는 것을 선호 순서로 나열한다.
const RECORDER_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg;codecs=opus',
] as const;

const FILE_EXTENSIONS: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/mp4': 'm4a',
  'audio/ogg': 'ogg',
};

export function isAudioRecordingSupported(): boolean {
  return (
    typeof MediaRecorder !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function'
  );
}

export function pickRecorderMimeType(
  isTypeSupported: (mimeType: string) => boolean,
): string | null {
  return RECORDER_MIME_TYPES.find((type) => isTypeSupported(type)) ?? null;
}

export function getRecorderMimeType(): string | null {
  return pickRecorderMimeType((type) => MediaRecorder.isTypeSupported(type));
}

export function toAudioFileName(mimeType: string): string {
  const baseType = mimeType.split(';')[0];
  return `segment.${FILE_EXTENSIONS[baseType] ?? 'webm'}`;
}

export async function requestMicrophoneStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ audio: true });
}

export function stopMediaStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}
